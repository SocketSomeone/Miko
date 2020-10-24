import moment from 'moment';
import i18n from 'i18n';

import { BaseService } from './Service';
import { BaseCommand, Context, TranslateFunc } from '../Commands/Command';
import { Message, GuildChannel, Guild } from 'eris';
import { GuildPermission } from '../../Misc/Models/GuildPermissions';
import EmojiResolver from '../../Misc/Utils/EmojiResolver';
import { withScope, captureException } from '@sentry/node';
import { Color } from '../../Misc/Enums/Colors';
import { BaseSettings } from '../../Entity/GuildSettings';
import { Images } from '../../Misc/Enums/Images';
import chalk from 'chalk';
import { Cache } from '../Decorators/Cache';
import { GuildSettingsCache } from '../Cache';
import { Service } from '../Decorators/Service';
import { MessagingService } from './Messaging';
import { InternalError } from '../Errors/InternalError';
import { SendError } from '../Errors/SendError';
import { AutomodSettings } from '../../Modules/Moderation/Models/AutomodSettings';

const RATE_LIMIT = 1;
const COOLDOWN = 5;

export class CommandService extends BaseService {
	@Service() msg: MessagingService;
	@Cache() guilds: GuildSettingsCache;

	private commandMap: Map<string, BaseCommand> = new Map();
	private commandCalls: Map<string, { last: number; warned: boolean }> = new Map();

	public async init() {
		for (const cmd of this.client.commands.values()) {
			if (this.commandMap.has(cmd.name.toLowerCase())) {
				console.error(chalk.red(`Duplicate command name ${chalk.blue(cmd.name)}`));
				process.exit(1);
			}
			this.commandMap.set(cmd.name.toLowerCase(), cmd);

			// Register aliases
			cmd.aliases.forEach((a) => {
				if (this.commandMap.has(a.toLowerCase())) {
					console.error(chalk.red(`Duplicate command alias ${chalk.blue(a)}`));
					process.exit(1);
				}
				this.commandMap.set(a.toLowerCase(), cmd);
			});

			console.log(chalk.green(`Loaded ${chalk.blue(cmd.name)} from ${chalk.blue(cmd.module.names.en)}`));
		}

		console.log(chalk.green(`Loaded ${chalk.blue(this.client.commands.size)} commands!`));
	}

	public async onClientReady() {
		this.client.on('messageCreate', this.onMessage.bind(this));

		await super.onClientReady();
	}

	public async onMessage(message: Message) {
		if (message.author.id === this.client.user.id || message.author.bot || !message.content.length) {
			return;
		}

		const channel = message.channel;
		const guild = (channel as GuildChannel).guild;

		const sets = guild ? await this.guilds.get(guild) : new BaseSettings();
		const t = <TranslateFunc>((phrase, replacements) => i18n.__({ locale: sets.locale, phrase }, replacements));

		const [cmd, splits] = await this.resolveCommand(message, sets.prefix);

		if (!cmd || (cmd.guildOnly && !guild)) {
			return;
		}

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

			if (!member) {
				member = guild.members.get(message.author.id);
			}

			if (!member) {
				member = await guild.getRESTMember(message.author.id);
			}

			if (!member) {
				return;
			}

			if (
				!(
					member.id === guild.ownerID ||
					member.permission.has(GuildPermission.ADMINISTRATOR) ||
					this.client.config.ownerID === member.id
				)
			) {
				const missingPerms = cmd.userPermissions.filter(
					(p) => !(channel as GuildChannel).permissionsOf(member.id).has(p)
				);

				if (missingPerms.length > 0) {
					const missed = Object.entries(GuildPermission)
						.filter(([s, v]) => missingPerms.some((x) => x === v))
						.map(([s]) => `\`${s}\``)
						.join(', ');

					await this.msg.sendReply(message, {
						color: Color.RED,
						author: { name: t('error.missed.userpermissions.title'), icon_url: Images.CRITICAL },
						description: t('error.missed.userpermissions.desc', { missed }),
						footer: null,
						timestamp: null
					});

					return;
				}
			}

			context.me = guild.members.get(this.client.user.id);

			if (!context.me) {
				context.me = await guild.getRESTMember(this.client.user.id).catch(() => undefined);
			}

			const missingPerms = cmd.botPermissions.filter(
				(p) => !(channel as GuildChannel).permissionsOf(this.client.user.id).has(p)
			);

			if (missingPerms.length > 0) {
				const missed = Object.entries(GuildPermission)
					.filter(([s, v]) => missingPerms.some((x) => x === v))
					.map(([s]) => `\`${s}\``)
					.join(', ');

				await this.msg.sendReply(message, {
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

			if (rawVal && arg.full) {
				rawVal = rawArgs.slice(i, rawArgs.length).join(' ');
			}

			try {
				const val = await resolver.resolve(rawVal, context, args);

				if (typeof val === typeof undefined && arg.required) {
					// TODO: Not found required argument

					return;
				}

				args.push(val);
			} catch (err) {
				const m = err.message as string;
				const s = m.split(/\r?\n/);

				await this.msg.sendReply(message, {
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
		} catch (err) {
			if (err instanceof InternalError) {
				const embed = this.msg.createEmbed({
					author: { name: err.message, icon_url: err.isWarn ? Images.WARN : Images.CRITICAL },
					color: err.isWarn ? Color.YELLOW : Color.RED,
					footer: null,
					timestamp: null
				});

				if (err.fallbackUser) {
					await this.msg.sendEmbed(await message.author.getDMChannel(), embed);
				} else {
					await this.msg.sendReply(message, embed);
				}

				return;
			}

			this.client.stats.cmdErrors++;

			console.error(err);

			withScope((scope) => {
				if (guild) {
					scope.setUser({ id: guild.id });
				}

				scope.setTag('command', cmd.name);
				scope.setExtra('guild', sets.id);
				scope.setExtra('channel', channel.id);
				scope.setExtra('message', message.content);

				captureException(err);
			});

			await this.msg.sendReply(message, {
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

		return acc.length < 1 ? rawArgs : rawArgs.concat(acc);
	}

	public async resolveCommand(message: Message, prefix?: string, guild?: Guild): Promise<[BaseCommand, string[]]> {
		if (!prefix) {
			if (!guild) {
				return [null, null];
			}

			let { prefix: GuildPrefix } = await this.guilds.get(guild);

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

				await this.msg.sendReply(message, {
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
