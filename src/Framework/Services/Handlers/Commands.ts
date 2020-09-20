import glob from 'glob';
import moment from 'moment';
import i18n from 'i18n';

import { writeFileSync } from 'fs';
import { BaseService } from '../Service';
import { Command, Context, TranslateFunc } from '../../Commands/Command';
import { resolve, relative, join } from 'path';
import { Precondition } from '../../../Modules/Permissions/Misc/Precondition';
import { Message, GuildChannel, Guild } from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import EmojiResolver from '../../../Misc/Utils/EmojiResolver';
import { withScope, captureException } from '@sentry/node';
import { ExecuteError } from '../../Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { BaseSettings } from '../../../Entity/GuildSettings';
import { Images } from '../../../Misc/Enums/Images';

const RATE_LIMIT = 1;
const COOLDOWN = 5;

export class CommandService extends BaseService {
	public commands: Command[] = [];

	private commandMap: Map<string, Command> = new Map();
	private commandCalls: Map<string, { last: number; warned: boolean }> = new Map();

	public async init() {
		console.log('Loading commands...');

		const files = glob.sync('./bin/**/Commands/**/*.js');

		for (const file of files) {
			const clazz = require(resolve(__dirname, `../../../../${file}`));

			if (clazz.default) {
				const constr = clazz.default;
				const parent = Object.getPrototypeOf(constr);

				if (!parent || !parent.name.endsWith('Command')) {
					continue;
				}

				const inst: Command = new constr(this.client);

				this.commands.push(inst);

				if (this.commandMap.has(inst.name.toLowerCase())) {
					console.error(`Duplicate command name ${inst.name} in ${relative(process.cwd(), file)}`);
					process.exit(1);
				}

				this.commandMap.set(inst.name.toLowerCase(), inst);

				for (const alias of inst.aliases) {
					if (this.commandMap.has(alias.toLowerCase())) {
						console.error(`Duplicate command alias ${alias} in ${relative(process.cwd(), file)}`);
						process.exit(1);
					}

					this.commandMap.set(alias.toLowerCase(), inst);
				}

				console.log(`Loaded ${inst.name} from ${relative(process.cwd(), file)}`);
			}
		}

		console.log(`Loaded ${this.commands.length} commands`);
	}

	public async onClientReady() {
		this.client.on('messageCreate', this.onMessage.bind(this));

		await Promise.all(this.commands.map((x) => x.onLoaded()));

		await super.onClientReady();
	}

	public async onMessage(message: Message) {
		if (message.author.id === this.client.user.id || message.author.bot || !message.content.length) return;

		const start = moment();

		const channel = message.channel,
			guild = (channel as GuildChannel).guild,
			sets = guild ? await this.client.cache.guilds.get(guild) : new BaseSettings();

		const [cmd, splits] = await this.resolve(message, sets.prefix);

		if (!cmd || (cmd.guildOnly && !guild)) {
			return;
		}

		const t: TranslateFunc = (phrase, replacements) => i18n.__({ locale: sets.locale, phrase }, replacements);

		const ratelimit = await this.isRatelimited(message, t);

		if (ratelimit) {
			return;
		}

		let context: Context = {
			guild,
			me: undefined,
			settings: sets,
			isPremium: false,
			funcs: {
				t,
				e: (emoji: string) => EmojiResolver(emoji, guild)
			}
		};

		if (guild) {
			let member = message.member;
			context.me = guild.members.get(this.client.user.id);

			if (!context.me) {
				context.me = await guild.getRESTMember(this.client.user.id).catch(() => undefined);
			}

			if (!member || !context.me) {
				return;
			}

			const withoutPermissions = new Set([guild.ownerID, this.client.config.ownerID]);

			if (!withoutPermissions.has(member.id)) {
				const permissions = await this.client.cache.permissions.get(guild);

				const { answer, permission } = Precondition.checkPermissions({ context, command: cmd, message }, permissions);

				if (!answer) {
					this.client.messages.sendReply(
						message,
						{
							author: {
								name: t('error.missed.permissions', { index: String(permission.index) }),
								icon_url: Images.CRITICAL
							},
							color: Color.RED,
							footer: null,
							timestamp: null
						},
						15000
					);

					return;
				} else if (permission === null && !member.permission.has(GuildPermission.ADMINISTRATOR)) {
					const missingPerms = cmd.userPermissions.filter(
						(p) => !(channel as GuildChannel).permissionsOf(member.id).has(p)
					);

					if (missingPerms.length > 0) {
						const missed = Object.entries(GuildPermission)
							.filter(([s, v]) => missingPerms.some((x) => x === v))
							.map(([s]) => `\`${s}\``)
							.join(', ');

						await this.client.messages.sendReply(message, {
							color: Color.RED,
							author: { name: t('error.missed.userpermissions.title'), icon_url: Images.CRITICAL },
							description: t('error.missed.userpermissions.desc', { missed }),
							footer: null,
							timestamp: null
						});

						return;
					}
				}
			}

			const missingPerms = cmd.botPermissions.filter(
				(p) => !(channel as GuildChannel).permissionsOf(this.client.user.id).has(p)
			);

			if (missingPerms.length > 0) {
				const missed = Object.entries(GuildPermission)
					.filter(([s, v]) => missingPerms.some((x) => x === v))
					.map(([s]) => `\`${s}\``)
					.join(', ');

				await this.client.messages.sendReply(message, {
					color: Color.RED,
					author: { name: t('error.missed.botpermissions.title'), icon_url: Images.CRITICAL },
					description: t('error.missed.botpermissions.desc', { missed }),
					footer: null,
					timestamp: null
				});

				return;
			}
		}

		moment.locale(sets.locale);

		const rawArgs: string[] = this.rawArgs(splits);
		const args: any[] = [];

		let i = 0;

		for (const arg of cmd.args) {
			let resolver = cmd.resolvers[i];
			let rawVal = rawArgs[i];

			if (arg.rest) {
				rawVal = rawVal.startsWith('"') && rawVal.endsWith('"') ? rawVal.substring(1, rawVal.length - 1) : rawVal;
			}

			if (arg.full) {
				rawVal = rawArgs.slice(i, rawArgs.length).join(' ');
			}

			try {
				const val = await resolver.resolve(rawVal, context, args);

				if (typeof val === typeof undefined && arg.required) {
					// TODO: missingRequired arg cmd.usage.replace('{prefix}, sets.prefix');

					return;
				}

				args.push(val);
			} catch (err) {
				const m = err.message as string;
				const s = m.split(/\r?\n/);

				await this.client.messages.sendReply(message, {
					color: Color.RED,
					author: { name: s[0], icon_url: Images.CRITICAL },
					description: s.slice(1).join('\n'),
					footer: null,
					timestamp: null
				});

				return;
			}

			i++;
		}

		this.client.stats.cmdProcessed++;

		try {
			await cmd.execute(message, args, context);

			this.client.stats.cmdFinished++;
		} catch (err) {
			if (err instanceof ExecuteError) {
				const embed = this.client.messages.createEmbed({
					author: { name: err.message, icon_url: Images.WARN },
					color: Color.YELLOW,
					footer: null,
					timestamp: null
				});

				await this.client.messages.sendReply(message, embed);

				return;
			}

			this.client.stats.cmdErrors++;

			console.error(err);

			withScope((scope) => {
				if (guild) {
					scope.setUser({ id: guild.id });
				}

				scope.setTag('command', cmd.name);
				scope.setExtra('channel', channel.id);
				scope.setExtra('message', message.content);
				scope.setExtra('Execute Time', moment().unix() - start.unix());

				captureException(err);
			});

			await this.client.messages.sendReply(message, {
				author: { name: t('error.execCommand.title'), icon_url: Images.CRITICAL },
				description: t('error.execCommand.desc', {
					error: err.message
				}),
				color: Color.RED,
				footer: {
					text: t('error.execCommand.footer')
				}
			});
		}
	}

	private hasPrefix(content: string, prefix?: string) {
		if (prefix && content.startsWith(prefix)) {
			return content.substring(prefix.length).trim();
		}

		const regex = /^(?:<@!?)?(\d+)>? (.*)$/;

		if (regex.test(content)) {
			const matches = content.match(regex);

			if (matches[1] !== this.client.user.id) {
				return null;
			}

			return matches[2].trim();
		}

		return null;
	}

	private rawArgs(splits: string[]): string[] {
		let rawArgs: string[] = [];
		let quote = false;
		let acc = '';

		for (let j = 0; j < splits.length; j++) {
			const split = splits[j];

			if (split.length === 0) {
				continue;
			}

			if (!quote && split.startsWith(`"`)) {
				quote = true;
				acc = split;

				continue;
			}

			if (split.endsWith(`"`)) {
				quote = false;
				acc += ' ' + split;

				rawArgs.push(acc);

				continue;
			}

			if (quote) {
				acc += ' ' + split;
			} else {
				rawArgs.push(split);
			}
		}

		return rawArgs;
	}

	public async resolve(message: Message, prefix?: string, guild?: Guild): Promise<[Command, string[]]> {
		if (!prefix) {
			if (!guild) {
				return [null, null];
			}

			let { prefix: GuildPrefix } = await this.client.cache.guilds.get(guild);

			prefix = GuildPrefix;
		}

		let content = this.hasPrefix(message.content.trim(), prefix);

		if (!content) {
			return [null, null];
		}

		let splits = content.split(' '),
			cmd = this.commandMap.get(splits[0].toLowerCase());

		if (cmd) {
			splits = splits.slice(1, splits.length);
		} else if (splits.length >= 2) {
			cmd = this.commandMap.get(splits.slice(0, 2).join(' ').toLowerCase());
			splits = splits.slice(2, splits.length);
		}

		return [cmd, splits];
	}

	private async isRatelimited(message: Message, t: TranslateFunc) {
		const now = moment().valueOf();

		let lastCall = this.commandCalls.get(message.author.id);

		if (!lastCall) {
			lastCall = {
				last: moment().valueOf(),
				warned: false
			};

			this.commandCalls.set(message.author.id, lastCall);
		} else if (now - lastCall.last < (1 / RATE_LIMIT) * 1000) {
			if (!lastCall.warned) {
				lastCall.warned = true;
				lastCall.last = now + COOLDOWN;

				await this.client.messages.sendReply(message, {
					color: Color.RED,
					author: { name: t('error.ratelimit.title'), icon_url: Images.CRITICAL },
					description: t('error.ratelimit.desc'),
					footer: null,
					timestamp: null
				});
			}

			return true;
		} else if (lastCall.warned) {
			lastCall.warned = false;
		}

		lastCall.last = now;

		return false;
	}
}
