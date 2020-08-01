import { BaseService } from '../Service';
import { Command, Context } from '../../Commands/Command';
import { resolve, relative } from 'path';
import { Precondition } from '../../../Misc/Classes/Precondition';
import { Message, GuildChannel, PrivateChannel, Member } from 'eris';
import { Defaults as GuildSettingsDefault } from '../../../Misc/Models/GuildSetting';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

import glob from 'glob';
import moment from 'moment';
import i18n from 'i18n';
import { Emoji } from '../../../Misc/Utils/EmojiResolver';
import { withScope, captureException } from '@sentry/node';
import { ExecuteError } from '../../Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';

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

				if (!parent || parent.name !== 'Command') {
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
						console.error(`Duplicate command alias ${alias}`);
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

		await super.onClientReady();
	}

	public async onMessage(message: Message) {
		if (message.author.id === this.client.user.id || message.author.bot || !message.content.length) {
			return;
		}

		const start = moment();

		const channel = message.channel;

		const guild = (channel as GuildChannel).guild;
		let content = message.content.trim();

		const sets = guild ? await this.client.cache.guilds.get(guild.id) : { ...GuildSettingsDefault };

		const t = (key: string, replacements?: { [key: string]: string }) =>
			i18n.__({ locale: sets.locale, phrase: key }, replacements);

		const e = (emoji: string) => Emoji.resolve(emoji, guild);

		if (sets.ignoreChannels && sets.ignoreChannels.length) {
			if (sets.ignoreChannels.includes(channel.id)) {
				return;
			}
		}

		content = this.hasPrefix(content, sets.prefix);

		if (!content) {
			return;
		}

		const splits = content.split(' ');

		const cmd = this.commandMap.get(splits[0].toLowerCase());

		if (!cmd) {
			if (channel instanceof PrivateChannel) {
				const user = message.author;

				const oldMessages = await message.channel.getMessages(2);
				const isInitialMessage = oldMessages.length <= 1;

				if (isInitialMessage) {
					/* TODO: Make message when dm and not founded command */
				}
			}

			return;
		}

		if (cmd.guildOnly && !guild) {
			return;
		}

		if (!(message as any).__sudo) {
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

					await this.client.messages.sendReply(message, t, {
						color: ColorResolve(Color.RED),
						title: t('error.ratelimit.title'),
						description: t('error.ratelimit.desc')
					});
				}

				return;
			} else if (lastCall.warned) {
				lastCall.warned = false;
			}

			lastCall.last = now;
		}

		const isPremium = false;

		let me: Member = undefined;

		let context: Context = {
			guild,
			me,
			funcs: {
				t,
				e
			},
			settings: sets,
			isPremium
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
				console.error(`Could not get member ${message.author.id} for ${guild.id}`);

				// TODO: make member not found error message;

				return;
			}

			if (!member.permission.has(GuildPermission.ADMINISTRATOR) && guild.ownerID !== member.id) {
				const permissions = await this.client.cache.permissions.get(guild.id);

				const { answer, permission } = Precondition.checkPermissions(
					{ context, command: cmd, message },
					(permissions && permissions.sort((a, b) => b.index - a.index)) || []
				);

				if (!answer) {
					if (sets.verbose) {
						// ErrorEmbed.send(this.message, `Доступ запрещён правилом #${ permission.index + 1 }`);
					}

					return;
				} else if (answer && permission === null) {
					const missingPerms = cmd.userPermissions.filter(
						(p) => !(channel as GuildChannel).permissionsOf(member.id).has(p)
					);

					if (missingPerms.length > 0) {
						// TODO: verbose configure
						// if (sets.verbose) {
						// }

						await this.client.messages.sendReply(message, t, {
							color: ColorResolve(Color.RED),
							title: t('error.missedUserPermissions.title'),
							description: t('error.missedUserPermissions.desc', {
								missed: Object.entries(GuildPermission)
									.filter(([s, v]) => missingPerms.some((x) => x === v))
									.map(([s]) => `\`${s}\``)
									.join(', ')
							})
						});

						return;
					}
				}
			}

			me = guild.members.get(this.client.user.id);

			if (!me) {
				me = await guild.getRESTMember(this.client.user.id);
			}

			context.me = me;

			const missingPerms = cmd.botPermissions.filter(
				(p) => !(channel as GuildChannel).permissionsOf(this.client.user.id).has(p)
			);

			if (missingPerms.length > 0) {
				await this.client.messages.sendReply(message, t, {
					color: ColorResolve(Color.RED),
					title: t('error.missedBotPermissions.title'),
					description: t('error.missedBotPermissions.desc', {
						missed: Object.entries(GuildPermission)
							.filter(([s, v]) => missingPerms.some((x) => x === v))
							.map(([s]) => `\`${s}\``)
							.join(', ')
					})
				});

				return;
			}
		}

		const rawArgs: string[] = [];

		let quote = false;
		let acc = '';

		for (let j = 1; j < splits.length; j++) {
			const split = splits[j];

			if (split.length === 0) {
				continue;
			}

			if (!quote && split.startsWith(`"`)) {
				quote = true;
				acc = '';
			}

			if (split.endsWith(`"`)) {
				quote = false;
				acc += `${split.substring(0, split.length - 1)}`;

				rawArgs.push(acc.substring(2));
				continue;
			}

			if (quote) {
				acc += ` ${split}`;
			} else {
				rawArgs.push(split);
			}
		}

		const args: any[] = [];
		let i = 0;

		for (const arg of cmd.args) {
			const resolver = cmd.resolvers[i];

			let rawVal = rawArgs[i];

			if (arg.rest) {
				rawVal = rawArgs
					.slice(i)
					.map((a) => (a.indexOf(' ') > 0 ? `"${a}"` : a))
					.join(' ');

				if (rawVal.length === 0) {
					rawVal = undefined;
				}
			}

			try {
				const val = await resolver.resolve(rawVal, context, args);
				cmd;
				if (typeof val === typeof undefined && arg.required) {
					// TODO: missingRequired arg cmd.usage.replace('{prefix}, sets.prefix');

					return;
				}

				args.push(val);
			} catch (err) {
				await this.client.messages.sendReply(message, t, {
					color: ColorResolve(Color.RED),
					title: t('error.arguments.title'),
					description: err.message
				});

				return;
			}

			i++;
		}

		this.client.stats.cmdProcessed++;

		let error: any = null;

		try {
			moment.locale(sets.locale);
			await cmd.execute(message, args, context);
		} catch (err) {
			if (err instanceof ExecuteError) {
				const embed = this.client.messages.createEmbed({
					title: t('error.execCommand.title'),
					color: ColorResolve(Color.ORANGE),
					...err.embed
				});

				await this.client.messages.sendReply(message, t, embed);
			} else {
				error = err;
			}
		}

		const execTime = moment().unix() - start.unix();

		if (error) {
			this.client.stats.cmdErrors++;

			console.error(error);

			withScope((scope) => {
				if (guild) {
					scope.setUser({ id: guild.id });
				}

				scope.setTag('command', cmd.name);
				scope.setExtra('channel', channel.id);
				scope.setExtra('message', message.content);

				captureException(error);
			});

			await this.client.messages.sendReply(message, t, {
				title: t('error.execCommand.title'),
				description: t('error.execCommand.desc', {
					error: error.message
				}),
				color: ColorResolve(Color.RED),
				footer: {
					text: t('error.execCommand.footer')
				}
			});
		}
	}

	hasPrefix(content: string, prefix?: string) {
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
}
