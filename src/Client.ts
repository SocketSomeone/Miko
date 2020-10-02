import 'reflect-metadata';

import i18n from 'i18n';
import chalk from 'chalk';

import moment, { Moment } from 'moment';

import { Client, Guild } from 'eris';
import { BaseService } from './Framework/Services/Service';
import { MessagingService } from './Framework/Services/Messaging';
import { BaseCache, GuildSettingsCache } from './Framework/Cache';
import { glob } from 'glob';
import { resolve } from 'path';
import { BaseGuild } from './Entity/Guild';
import { BaseCommand, TranslateFunc } from './Framework/Commands/Command';
import { Images } from './Misc/Enums/Images';
import { BaseModule } from './Framework/Module';
import { Service, serviceInjections } from './Framework/Decorators/Service';
import { Cache, cacheInjections } from './Framework/Decorators/Cache';
import { RabbitMQService as RabbitMqService } from './Framework/Services/RabbitMQ';
import { ConfigureModule } from './Modules/Configure/ConfigureModule';
import { LogModule } from './Modules/Log/LogModule';
import { FrameworkModule } from './Framework/FrameworkModule';
import { EconomyModule } from './Modules/Economy/EconomyModule';
import { EmotionsModule } from './Modules/Emotions/EmotionsModule';
import { VoiceModule } from './Modules/Voice/VoiceModule';
import { ModerationModule } from './Modules/Moderation/ModerationModule';
import { GamblingModule } from './Modules/Gambling/GamblingModule';
import { PermissionsModule } from './Modules/Permissions/PermissionModule';
import { WelcomeModule } from './Modules/Welcome/WelcomeModule';
import { UtilitiesModule } from './Modules/Utilities/UtilitiesModule';

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

export interface ClientOptions {
	token: string;
	firstShard: number;
	lastShard: number;
	shardCount: number;
	flags: string[];
	config: any;
}

export class BaseClient extends Client {
	public config: any;
	public flags: string[];

	public firstShardId: number;
	public lastShardId: number;
	public shardCount: number;

	public modules: Map<new (client: BaseClient) => BaseModule, BaseModule>;
	public services: Map<new (module: BaseModule) => BaseService, BaseService>;
	public caches: Map<new (module: BaseModule) => BaseCache<any>, BaseCache<any>>;
	public commands: Map<new (module: BaseModule) => BaseCommand, BaseCommand>;

	public hasStarted: boolean = false;
	public startedAt: Moment = moment();

	public shardsConnected: Set<number> = new Set();
	public activityInterval: NodeJS.Timer;
	public stats: {
		shardConnects: number;
		shardDisconnects: number;
		shardResumes: number;
		wsEvents: number;
		wsWarnings: number;
		wsErrors: number;
		cmdProcessed: number;
		cmdErrors: number;
	};

	private startingServices: BaseService[];
	@Service() private messageService: MessagingService;
	@Service() private rabbitMqService: RabbitMqService;
	@Cache() private guildsCache: GuildSettingsCache;

	public constructor({ token, firstShard, lastShard, shardCount, config, flags }: ClientOptions) {
		super(token, {
			allowedMentions: {
				everyone: false,
				roles: true,
				users: true
			},
			firstShardID: firstShard,
			lastShardID: lastShard,
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

		this.stats = {
			shardConnects: 0,
			shardDisconnects: 0,
			shardResumes: 0,
			wsEvents: 0,
			wsWarnings: 0,
			wsErrors: 0,
			cmdProcessed: 0,
			cmdErrors: 0
		};

		this.firstShardId = firstShard;
		this.lastShardId = lastShard;
		this.shardCount = shardCount;

		this.modules = new Map();
		this.services = new Map();
		this.caches = new Map();
		this.commands = new Map();
		this.startingServices = [];

		this.config = config;
		this.flags = flags;
	}

	public async init() {
		await Promise.all(
			glob
				.sync('./bin/Extensions/**/*.ext.js')
				.map((x) => import(resolve(__dirname, `../${x.substr(0, x.length - 3)}`)))
		);

		this.registerModule(FrameworkModule);
		this.registerModule(ConfigureModule);
		this.registerModule(EconomyModule);
		this.registerModule(EmotionsModule);
		this.registerModule(GamblingModule);
		this.registerModule(LogModule);
		this.registerModule(ModerationModule);
		this.registerModule(PermissionsModule);
		this.registerModule(UtilitiesModule);
		this.registerModule(VoiceModule);
		this.registerModule(WelcomeModule);

		this.setupInjections(this);

		this.services.forEach((s) => this.setupInjections(s));
		this.caches.forEach((c) => this.setupInjections(c));
		this.commands.forEach((c) => this.setupInjections(c));

		this.startingServices = [...this.services.values()];

		await Promise.all([...this.modules.values()].map((mod) => mod.init()));
		await Promise.all([...this.services.values()].map((srv) => srv.init()));
		await Promise.all([...this.commands.values()].map((cmd) => cmd.init()));

		this.commands.forEach((cmd) => cmd.resolvers.forEach((res) => this.setupInjections(res)));

		this.on('ready', this.onClientReady);
		this.on('connect', this.onShardConnect);

		this.on('shardReady', this.onShardReady);
		this.on('shardResume', this.onShardResume);
		this.on('shardDisconnect', this.onShardDisconnect);

		this.on('guildCreate', this.onGuildCreate);
		this.on('guildDelete', this.onGuildDelete);
		this.on('guildUnavailable', this.onGuildUnavailable);

		this.on('warn', this.onWarn);
		this.on('error', this.onError);
		this.on('rawWS', this.onRawWS);
	}

	public async waitForStartupTicket() {
		const start = process.uptime();
		const interval = setInterval(
			() => console.log(`Waiting for ticket since ${chalk.blue(Math.floor(process.uptime() - start))} seconds...`),
			10000
		);
		await this.rabbitMqService.waitForStartupTicket();
		clearInterval(interval);
	}

	private async onClientReady() {
		if (this.hasStarted) {
			console.error('BOT HAS ALREADY STARTED, IGNORING EXTRA READY EVENT');
			return;
		}

		await Promise.all([...this.services.values()].map((s) => s.onClientReady()));

		this.hasStarted = true;
		this.startedAt = moment();

		console.log(chalk.green(`Client ready! Serving ${chalk.blue(this.guilds.size)} guilds.`));

		await Promise.all([...this.caches.values()].map((c) => c.init()));
		await BaseGuild.saveGuilds(this.guilds.map((g) => g));

		await this.setActivity();
		this.activityInterval = setInterval(() => this.setActivity(), 1 * 60 * 1000);
	}

	private async setActivity() {
		this.editStatus('online', {
			name: 'mikoapp.xyz | !help',
			type: 3
		});
	}

	public serviceStartupDone(service: BaseService) {
		this.startingServices = this.startingServices.filter((s) => s !== service);

		if (this.startingServices.length === 0) {
			console.log(chalk.green(`All services ready`));
			this.rabbitMqService.endStartup().catch((err) => console.error(err));
		}
	}

	private async onGuildCreate(guild: Guild) {
		await BaseGuild.saveGuilds([guild], {
			joinedAt: moment(),
			deletedAt: null
		});

		const { locale } = await this.guildsCache.get(guild);
		const ownerDM = await this.getDMChannel(guild.ownerID);

		const t: TranslateFunc = (phrase, replacements) => i18n.__({ phrase, locale }, replacements);

		const modules = [...this.modules.values()]
			.sort((a, b) => a.names[locale].localeCompare(b.names[locale]))
			.filter((m) => !(m instanceof FrameworkModule))
			.map((m) => m.names[locale])
			.join('\n');

		const embed = this.messageService.createEmbed({
			author: { name: t('others.onBotAdd.title', { guild: guild.name }), icon_url: Images.HELP },
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

	private async onShardReady(shardId: number) {
		console.log(chalk.green(`Shard ${chalk.blue(shardId + 1)} is ready`));
	}

	private async onShardConnect(shardId: number) {
		console.log(chalk.green(`Shard ${chalk.blue(shardId + 1)} is connected to the gateway`));

		this.shardsConnected.add(shardId + 1);
		this.stats.shardConnects++;
	}

	private async onShardResume(shardId: number) {
		console.log(chalk.green(`Shard ${chalk.blue(shardId + 1)} has resumed`));
		this.shardsConnected.add(shardId + 1);
		this.stats.shardResumes++;
	}

	private async onShardDisconnect(err: Error, shardId: number) {
		console.error(chalk.red(`Shard ${chalk.blue(shardId + 1)} was disconnected: ${err}`));

		this.shardsConnected.delete(shardId + 1);
		this.stats.shardDisconnects++;
	}

	private async onGuildUnavailable(guild: Guild) {
		console.error('DISCORD GUILD_UNAVAILABLE:', guild.id);
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

	public registerModule<T extends BaseModule>(module: new (client: BaseClient) => T) {
		if (this.modules.has(module)) {
			throw new Error(`Module ${module.name} registered multiple times`);
		}

		this.modules.set(module, new module(this));
	}

	public registerService<T extends BaseService>(module: BaseModule, service: new (module: BaseModule) => T) {
		if (this.services.has(service)) {
			throw new Error(`Service ${service.name} registered multiple times`);
		}

		this.services.set(service, new service(module));
	}

	public registerCache<P extends any, T extends BaseCache<P>>(
		module: BaseModule,
		cache: new (module: BaseModule) => T
	) {
		if (this.caches.has(cache)) {
			throw new Error(`Cache ${cache.name} registered multiple times`);
		}

		this.caches.set(cache, new cache(module));
	}

	public registerCommand<T extends BaseCommand>(module: BaseModule, command: new (module: BaseModule) => T) {
		if (this.commands.has(command)) {
			throw new Error(`Command ${command.name} (${new command(module).name}) registered multiple times`);
		}

		this.commands.set(command, new command(module));
	}

	public setupInjections(obj: any) {
		const objName = chalk.blue(obj.name || obj.constructor.name);

		let srvObj = obj.constructor;

		while (srvObj) {
			const serviceInjs = serviceInjections.get(srvObj) || new Map();

			for (const [key, getInjType] of serviceInjs) {
				const injConstr = getInjType();
				const injService = this.services.get(injConstr);

				if (!injService) {
					throw new Error(`Could not inject ${chalk.blue(injConstr.name)} into ${objName}:${chalk.blue(key)}`);
				}

				obj[key] = injService;
				console.debug(chalk.green(`Injected ${chalk.blue(injConstr.name)} into ${objName}:${chalk.blue(key)}`));
			}

			srvObj = Object.getPrototypeOf(srvObj);
		}

		let cacheObj = obj.constructor;

		while (cacheObj) {
			const cacheInjs = cacheInjections.get(cacheObj) || new Map();

			for (const [key, getInjType] of cacheInjs) {
				const injConstr = getInjType();
				const injCache = this.caches.get(injConstr);

				if (!injCache) {
					throw new Error(`Could not inject ${chalk.blue(injConstr.name)} into ${objName}:${chalk.blue(key)}`);
				}

				obj[key] = injCache;
				console.debug(chalk.green(`Injected ${chalk.blue(injConstr.name)} into ${objName}:${chalk.blue(key)}`));
			}

			cacheObj = Object.getPrototypeOf(cacheObj);
		}
	}

	public flushCaches(guildId: string, caches?: string[]) {
		[...this.caches.entries()].forEach(
			([key, cache]) =>
				(!caches ||
					!caches.length ||
					caches.some((c) => c.toLowerCase() === key.name.toLowerCase().replace('cache', ''))) &&
				cache.flush(guildId)
		);
	}

	public getCacheSizes() {
		let channelCount = this.groupChannels.size + this.privateChannels.size;
		let roleCount = 0;

		this.guilds.forEach((g) => {
			channelCount += g.channels.size;
			roleCount += g.roles.size;
		});

		const res: any = {
			guilds: this.guilds.size,
			users: this.users.size,
			channels: channelCount,
			roles: roleCount
		};

		[...this.caches.entries()].forEach(
			([key, cache]) => (res[key.name.toLowerCase().replace('cache', '')] = cache.size)
		);

		return res;
	}
}
