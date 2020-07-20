'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
require('reflect-metadata');
const moment_1 = __importDefault(require('moment'));
const eris_1 = require('eris');
const i18n_1 = __importDefault(require('i18n'));
const chalk_1 = __importDefault(require('chalk'));
const GuildSettingsCache_1 = require('./Framework/Cache/GuildSettingsCache');
const prefix_1 = require('./Framework/Services/Manager/prefix');
const Commands_1 = require('./Framework/Services/Handlers/Commands');
const PermissionsCache_1 = require('./Framework/Cache/PermissionsCache');
i18n_1.default.configure({
	locales: ['ru', 'en'],
	defaultLocale: 'ru',
	syncFiles: true,
	directory: __dirname + '/../i18n',
	objectNotation: true,
	logDebugFn: function (msg) {
		console.log('debug', msg);
	},
	logWarnFn: function (msg) {
		console.error('warn', msg);
	},
	logErrorFn: function (msg) {
		console.error('error', msg);
	}
});
class BaseClient extends eris_1.Client {
	constructor(token) {
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
		this.hasStarted = false;
		this.stats = {
			wsEvents: 0,
			wsWarnings: 0,
			wsErrors: 0,
			cmdProcessed: 0,
			cmdErrors: 0
		};
		this.service = {
			prefixManager: new prefix_1.PrefixManger(this),
			commandService: new Commands_1.CommandService(this)
		};
		Object.entries(this.service).map(([key, service]) => {
			const shortcuts = this;
			shortcuts[key] = service;
		});
		this.startingServices = Object.values(this.service);
		this.cache = {
			guilds: new GuildSettingsCache_1.GuildSettingsCache(this),
			permissions: new PermissionsCache_1.PermissionsCache(this)
		};
		this.on('ready', this.onClientReady);
		this.on('warn', this.onWarn);
		this.on('error', this.onError);
		this.on('rawWS', this.onRawWS);
	}
	async init() {
		// NO-OP
		await Promise.all(Object.values(this.service).map((x) => x.init()));
	}
	async onClientReady() {
		if (this.hasStarted) {
			console.error('BOT HAS ALREADY STARTED, IGNORING EXTRA READY EVENT');
			return;
		}
		await Promise.all(Object.values(this.service).map((s) => s.onClientReady()));
		this.hasStarted = true;
		this.startedAt = moment_1.default();
		console.log(chalk_1.default.green(`Client ready! Serving ${chalk_1.default.blue(this.guilds.size)} guilds.`));
		await Promise.all(Object.values(this.cache).map((c) => c.init()));
	}
	serviceStartupDone(service) {
		this.startingServices = this.startingServices.filter((s) => s !== service);
		if (this.startingServices.length === 0) {
			console.log(`All services ready`);
		}
	}
	async onWarn(warn) {
		console.error('DISCORD WARNING:', warn);
		this.stats.wsWarnings++;
	}
	async onError(error) {
		console.error('DISCORD ERROR:', error);
		this.stats.wsErrors++;
	}
	async onRawWS() {
		this.stats.wsEvents++;
	}
}
exports.BaseClient = BaseClient;
//# sourceMappingURL=Client.js.map
