import 'reflect-metadata';

import moment, { Moment } from 'moment';
import { Client, Guild } from 'eris';
import { BaseService } from './Framework/Services/Service';
import { BaseCache } from './Framework/Cache/Cache';

import i18n from 'i18n';
import chalk from 'chalk';
import { GuildSettingsCache } from './Framework/Cache/GuildSettingsCache';
import { PrefixManger } from './Framework/Services/Manager/prefix';
import { CommandService } from './Framework/Services/Handlers/Commands';
import { PermissionsCache } from './Framework/Cache/PermissionsCache';

i18n.configure({
	locales: ['ru', 'en'],
	defaultLocale: 'ru',
	syncFiles: true,
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
}

/**
 * Shortcuts
 */
export interface BaseClient {
	prefixManager: PrefixManger;
	commandService: CommandService;
}

export class BaseClient extends Client {
	private hasStarted: boolean = false;
	public startedAt: Moment;

	public cache: BaseCacheObject;
	public service: { [key: string]: BaseService };
	private startingServices: BaseService[];

	public stats: {
		wsEvents: number;
		wsWarnings: number;
		wsErrors: number;
		cmdProcessed: number;
		cmdErrors: number;
	};

	public constructor(token: string) {
		super(token, {
			allowedMentions: {
				everyone: false,
				roles: true,
				users: true
			},
			disableEvents: {
				TYPING_START: true,
				PRESENCE_UPDATE: true,
				VOICE_STATE_UPDATE: true,
				USER_UPDATE: true
			},
			restMode: true,
			messageLimit: 2,
			getAllUsers: false,
			compress: true,
			guildCreateTimeout: 60000
		});

		this.stats = {
			wsEvents: 0,
			wsWarnings: 0,
			wsErrors: 0,
			cmdProcessed: 0,
			cmdErrors: 0
		};

		this.service = {
			prefixManager: new PrefixManger(this),
			commandService: new CommandService(this)
		};

		Object.entries(this.service).map(([key, service]) => {
			const shortcuts = this as any;

			shortcuts[key] = service;
		});

		this.startingServices = Object.values(this.service);

		this.cache = {
			guilds: new GuildSettingsCache(this),
			permissions: new PermissionsCache(this)
		};

		this.on('ready', this.onClientReady);
		this.on('warn', this.onWarn);
		this.on('error', this.onError);
		this.on('rawWS', this.onRawWS);
	}

	public async init() {
		// NO-OP

		await Promise.all(Object.values(this.service).map((x) => x.init()));
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
	}

	public serviceStartupDone(service: BaseService) {
		this.startingServices = this.startingServices.filter((s) => s !== service);

		if (this.startingServices.length === 0) {
			console.log(`All services ready`);
		}
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
