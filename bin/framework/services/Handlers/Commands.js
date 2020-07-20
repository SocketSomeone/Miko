'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const Service_1 = require('../Service');
const path_1 = require('path');
const Precondition_1 = require('../../../Misc/Classes/Precondition');
const eris_1 = require('eris');
const GuildSetting_1 = require('../../../Misc/Models/GuildSetting');
const GuildPermissions_1 = require('../../../Misc/Enums/GuildPermissions');
const glob_1 = __importDefault(require('glob'));
const moment_1 = __importDefault(require('moment'));
const RATE_LIMIT = 1;
const COOLDOWN = 5;
class CommandService extends Service_1.BaseService {
	constructor() {
		super(...arguments);
		this.commands = [];
		this.commandMap = new Map();
		this.commandCalls = new Map();
	}
	async init() {
		console.log('Loading commands...');
		const files = glob_1.default.sync('./bin/**/Commands/**/*.js');
		for (const file of files) {
			const clazz = require(path_1.resolve(__dirname, `../../../../${file}`));
			if (clazz.default) {
				const constr = clazz.default;
				const parent = Object.getPrototypeOf(constr);
				if (!parent || parent.name !== 'Command') {
					continue;
				}
				const inst = new constr(this.client);
				this.commands.push(inst);
				if (this.commandMap.has(inst.name.toLowerCase())) {
					console.error(`Duplicate command name ${inst.name}`);
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
				console.log(`Loaded ${inst.name} from ${path_1.relative(process.cwd(), file)}`);
			}
		}
		console.log(`Loaded ${this.commands.length} commands`);
	}
	async onClientReady() {
		this.client.on('messageCreate', this.onMessage.bind(this));
		await super.onClientReady();
	}
	async onMessage(message) {
		if (message.author.id === this.client.user.id || message.author.bot || !message.content.length) {
			return;
		}
		const start = moment_1.default();
		const channel = message.channel;
		const guild = channel.guild;
		let content = message.content.trim();
		const sets = guild ? await this.client.cache.guilds.get(guild.id) : Object.assign({}, GuildSetting_1.Defaults);
		const t = (key, replacements) => i18n.__({ locale: sets.locale, phrase: key }, replacements);
		if (sets.ignoreChannels && sets.ignoreChannels.length) {
			if (sets.ignoreChannels.includes(channel.id)) {
				return;
			}
		}
		content = this.client.prefixManager.hasPrefix(content, sets.prefix);
		if (!content) {
			return;
		}
		const splits = content.split(' ');
		const cmd = this.commandMap.get(splits[0].toLowerCase());
		if (!cmd) {
			if (channel instanceof eris_1.PrivateChannel) {
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
		if (!message.__sudo) {
			const now = moment_1.default().valueOf();
			let lastCall = this.commandCalls.get(message.author.id);
			if (!lastCall) {
				lastCall = {
					last: moment_1.default().valueOf(),
					warned: false
				};
				this.commandCalls.set(message.author.id, lastCall);
			} else if (now - lastCall.last < (1 / RATE_LIMIT) * 1000) {
				if (!lastCall.warned) {
					lastCall.warned = true;
					lastCall.last = now + COOLDOWN;
					// TODO: Message when rate limited
				}
				return;
			} else if (lastCall.warned) {
				lastCall.warned = false;
			}
			lastCall.last = now;
		}
		const isPremium = false;
		let me = undefined;
		let context = {
			guild,
			me,
			t,
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
			if (!member.permission.has(GuildPermissions_1.GuildPermission.ADMINISTRATOR) && guild.ownerID !== member.id) {
				const permissions = await this.client.cache.permissions.get(guild.id);
				const { answer, permission } = Precondition_1.Precondition.checkPermissions(
					{ context, command: cmd, message },
					(permissions && permissions.sort((a, b) => b.index - a.index)) || []
				);
				if (!answer) {
					if (sets.verbose) {
						// ErrorEmbed.send(this.message, `Доступ запрещён правилом #${ permission.index + 1 }`);
					}
					return;
				} else if (answer && permission === null) {
					const missingPerms = cmd.userPermissions.filter((p) => !channel.permissionsOf(member.id).has(p));
					if (missingPerms.length >= 0) {
						if (sets.verbose) {
						}
						return;
					}
				}
			}
			me = guild.members.get(this.client.user.id);
			if (!me) {
				me = await guild.getRESTMember(this.client.user.id);
			}
			context.me = me;
			const missingPerms = cmd.botPermissions.filter((p) => !channel.permissionsOf(this.client.user.id).has(p));
			if (missingPerms.length >= 0) {
				// TODO: Missed Permissions message;
				return;
			}
		}
		const rawArgs = [];
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
		const args = [];
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
				if (typeof val === typeof undefined && arg.required) {
					// TODO: missingRequired arg cmd.usage.replace('{prefix}, sets.prefix');
					return;
				}
				args.push(val);
			} catch (err) {
				// TODO: Invalid resolver message;
				return;
			}
			i++;
		}
		this.client.stats.cmdProcessed++;
		let error = null;
		try {
			await cmd.execute(message, args, context);
		} catch (err) {
			error = err;
		}
		const execTime = moment_1.default().unix() - start.unix();
		if (error) {
			this.client.stats.cmdErrors++;
			console.error(error);
			// TODO: Message with Error;
		}
	}
}
exports.CommandService = CommandService;
//# sourceMappingURL=Commands.js.map
