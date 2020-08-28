import 'reflect-metadata';
import 'moment-timezone';

import i18n from 'i18n';
import chalk from 'chalk';

import moment, { Moment } from 'moment';

import { Client, Guild } from 'eris';
import { BaseService } from './Framework/Services/Service';
import { CommandService } from './Framework/Services/Handlers/Commands';
import { RabbitMqService } from './Framework/Services/Manager/RabbitMQ';
import { MessageService } from './Framework/Services/Manager/Message';
import { BaseCache, GuildSettingsCache, PermissionsCache, PunishmentsCache } from './Framework/Cache';
import { glob } from 'glob';
import { resolve } from 'path';
import { ModerationService } from './Modules/Moderation/Services/Moderation';
import { SchedulerService } from './Framework/Services/Manager/Scheduler';
import { BaseGuild } from './Entity/Guild';
import { PrivateService } from './Modules/Voice/Services/PrivateSystem';
import { LoggingService } from './Modules/Log/Services/LoggerService';
import { TranslateFunc } from './Framework/Commands/Command';
import { CommandGroup } from './Misc/Models/CommandGroup';
import { ShopRolesCache } from './Modules/Configure/Cache/ShopRole';
import { Images } from './Misc/Enums/Images';

moment.tz.setDefault('Europe/Moscow');

i18n.configure({
	locales: ['ru', 'en'],
	defaultLocale: 'ru',
	syncFiles: true,
	autoReload: true,
	directory: __dirname + '/../i18n',
	objectNotation: true,
	logDebugFn: function (msg: string) {
		console.log('debug', msg);
	},
	logWarnFn: function (msg: string) {
		console.error('warn', msg);
	},
	logErrorFn: function (msg: string) {
		console.error('error', msg);
	}
});

interface BaseCacheObject {
	[key: string]: BaseCache<any>;

	guilds: GuildSettingsCache;
	permissions: PermissionsCache;
	punishments: PunishmentsCache;
	shop: ShopRolesCache;
}

/**
 * Shortcuts
 */
export interface BaseClient {
	commands: CommandService;
	rabbitmq: RabbitMqService;
	messages: MessageService;
	moderation: ModerationService;
	scheduler: SchedulerService;
	privates: PrivateService;
	logger: LoggingService;
}

interface ClientOptions {
	token: string;
	shardId: number;
	shardCount: number;
	config: any;
	flags: string[];
}

export class BaseClient extends Client {
	public hasStarted: boolean = false;
	public startedAt: Moment = moment();

	public config: any;
	public flags: string[];
	public shardId: number;
	public shardCount: number;

	public service: {
		[key: string]: BaseService;
	};

	public cache: BaseCacheObject;
	private startingServices: BaseService[];
	private activityInterval: NodeJS.Timeout;

	public gatewayConnected: boolean;
	public stats: {
		wsEvents: number;
		wsWarnings: number;
		wsErrors: number;
		cmdProcessed: number;
		cmdErrors: number;
		unavailableGuilds: number;
	};

	public constructor({ token, shardId, shardCount, config, flags }: ClientOptions) {
		super(token, {
			allowedMentions: {
				everyone: false,
				roles: true,
				users: true
			},
			firstShardID: shardId - 1,
			lastShardID: shardId - 1,
			maxShards: shardCount,
			disableEvents: {
				TYPING_START: true,
				PRESENCE_UPDATE: true,
				USER_UPDATE: true
			},
			restMode: true,
			messageLimit: 2,
			getAllUsers: false,
			compress: true,
			guildCreateTimeout: 60000
		});

		this.config = config;
		this.flags = flags;
		this.shardId = shardId;
		this.shardCount = shardCount;

		this.stats = {
			wsEvents: 0,
			wsWarnings: 0,
			wsErrors: 0,
			cmdProcessed: 0,
			cmdErrors: 0,
			unavailableGuilds: 0
		};

		this.service = {
			commands: new CommandService(this),
			rabbitmq: new RabbitMqService(this),
			messages: new MessageService(this),
			moderation: new ModerationService(this),
			scheduler: new SchedulerService(this),
			privates: new PrivateService(this),
			logger: new LoggingService(this)
		};

		Object.entries(this.service).map(([key, service]) => {
			const shortcuts = this as any;

			shortcuts[key] = service;
		});

		this.startingServices = Object.values(this.service);

		this.cache = {
			guilds: new GuildSettingsCache(this),
			permissions: new PermissionsCache(this),
			punishments: new PunishmentsCache(this),
			shop: new ShopRolesCache(this)
		};

		this.on('ready', this.onClientReady);
		this.on('guildCreate', this.onGuildCreate);
		this.on('guildDelete', this.onGuildDelete);
		this.on('guildUnavailable', this.onGuildUnavailable);
		this.on('connect', this.onConnect);
		this.on('shardDisconnect', this.onDisconnect);
		this.on('warn', this.onWarn);
		this.on('error', this.onError);
		this.on('rawWS', this.onRawWS);
	}

	public async init() {
		const files = glob.sync('./bin/Extensions/**/*.ext.js');

		await Promise.all(files.map((x) => import(resolve(__dirname, `../${x.substr(0, x.length - 3)}`))));

		await Promise.all(Object.values(this.service).map((x) => x.init()));
	}

	public async waitForStartupTicket() {
		const start = process.uptime();
		const interval = setInterval(
			() => console.log(`Waiting for ticket since ${chalk.blue(Math.floor(process.uptime() - start))} seconds...`),
			10000
		);

		await this.rabbitmq.waitForStartupTicket();
		clearInterval(interval);
	}

	public serviceStartupDone(service: BaseService) {
		this.startingServices = this.startingServices.filter((s) => s !== service);

		if (this.startingServices.length === 0) {
			console.log(chalk.green(`All services ready`));
			this.rabbitmq.endStartup().catch((err) => console.error(err));
		}
	}

	private async onClientReady() {
		if (this.hasStarted) {
			console.error('BOT HAS ALREADY STARTED, IGNORING EXTRA READY EVENT');
			return;
		}

		await Promise.all(Object.values(this.service).map((s) => s.onClientReady()));

		this.hasStarted = true;
		this.startedAt = moment();

		console.log(chalk.green(`Client ready! Serving ${chalk.blue(this.guilds.size)} guilds.`));

		await Promise.all(Object.values(this.cache).map((c) => c.init()));

		await BaseGuild.saveGuilds(this.guilds.map((g) => g));

		await this.setActivity();
		this.activityInterval = setInterval(() => this.setActivity(), 1 * 60 * 1000);
	}

	private async setActivity() {
		this.editStatus('online', {
			name: [
				`за ${this.guilds.size} серверами`,
				`!help - Invite Miko`,
				`за ${this.guilds.reduce((acc, x) => (acc += x.memberCount), 0)} участниками`
			].random(),
			type: 3
		});
	}

	private async onGuildCreate(guild: Guild) {
		await BaseGuild.saveGuilds([guild], { joinedAt: moment(), deletedAt: null });

		const { locale } = await this.cache.guilds.get(guild);
		const ownerDM = await this.getDMChannel(guild.ownerID);

		const t: TranslateFunc = (phrase, replacements) => i18n.__({ phrase, locale }, replacements);

		const modules = Object.entries(CommandGroup)
			.sort(([a], [b]) => a.localeCompare(b))
			.filter(([key]) => key.length > 1)
			.map(([key]) => t(`others.modules.${key.toLowerCase()}`))
			.join('\n');

		const embed = this.messages.createEmbed({
			author: { name: t('others.onBotAdd.title', { guild: guild.name }), icon_url: Images.LIST },
			description: t('others.onBotAdd.desc', { modules }),
			thumbnail: { url: this.user.dynamicAvatarURL('png', 4096) },
			fields: [
				{
					name: '\u200b',
					value: t('others.onBotAdd.field'),
					inline: false
				}
			],
			footer: {
				icon_url: this.user.dynamicAvatarURL('png', 4096),
				text: t('others.onBotAdd.footer')
			}
		});

		await ownerDM.createMessage({ embed }).catch(() => undefined);
	}

	private async onGuildDelete(guild: Guild) {
		await BaseGuild.saveGuilds([guild], {
			deletedAt: moment()
		});
	}

	private async onConnect() {
		console.error('DISCORD CONNECT');
		this.gatewayConnected = true;
		await this.rabbitmq.sendStatusToManager();
	}

	private async onDisconnect(err: Error) {
		console.error('DISCORD DISCONNECT');
		this.gatewayConnected = false;
		await this.rabbitmq.sendStatusToManager(err);

		if (err) {
			console.error(err);
		}
	}

	private async onGuildUnavailable(guild: Guild) {
		console.error('DISCORD GUILD_UNAVAILABLE:', guild.id);
		this.stats.unavailableGuilds++;
	}

	private async onWarn(warn: string) {
		console.error('DISCORD WARNING:', warn);
		this.stats.wsWarnings++;
	}

	private async onError(error: Error) {
		console.error('DISCORD ERROR:', error);
		this.stats.wsErrors++;
	}

	private async onRawWS() {
		this.stats.wsEvents++;
	}
}
