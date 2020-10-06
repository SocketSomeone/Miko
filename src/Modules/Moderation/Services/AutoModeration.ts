import { Guild, Member, Message, TextChannel, User } from 'eris';
import moment from 'moment';
import { BaseSettings } from '../../../Entity/GuildSettings';
import { GuildSettingsCache } from '../../../Framework/Cache';
import { Cache } from '../../../Framework/Decorators/Cache';
import { Service } from '../../../Framework/Decorators/Service';
import { BaseService } from '../../../Framework/Services/Service';
import { Violation } from '../../../Misc/Enums/Violation';
import { ModerationService } from './Moderation';

interface Arguments {
	guild: Guild;
	settings: BaseSettings;
}

interface MiniMessage {
	id: string;
	author: string;
	createdAt: number;
	content: string;
	mentions: number;
	roleMentions: number;
}

type autoModFunctions = {
	[key in Violation]: (guild: Guild, message: Message, settings: BaseSettings) => Promise<boolean>;
};

export class AutoModerationService extends BaseService {
	@Service() protected mod: ModerationService;
	@Cache() protected guilds: GuildSettingsCache;

	private messageCache: Map<string, MiniMessage[]> = new Map();

	public getMessageCacheSize() {
		return this.messageCache.size;
	}

	private automodFunctions: autoModFunctions = {
		[Violation.invites]: this.invites.bind(this),
		[Violation.allCaps]: this.allCaps.bind(this),
		[Violation.duplicateText]: this.duplicateText.bind(this),
		[Violation.zalgo]: this.zalgoDetect.bind(this),
		[Violation.emojis]: this.emojis.bind(this),
		[Violation.externalLinks]: this.externalLinks.bind(this),
		[Violation.mentions]: this.mentions.bind(this)
	};

	public async init() {
		const scanMessageCache = () => {
			const now = moment();
			this.messageCache.forEach((value, key) => {
				this.messageCache.set(
					key,
					value.filter((m) => now.diff(m.createdAt, 'second') < 60)
				);
			});
		};

		setInterval(scanMessageCache, 60 * 1000);
	}

	public async onClientReady() {
		this.client.on('messageCreate', this.onMessage.bind(this));

		await super.onClientReady();
	}

	private async onMessage(message: Message) {
		const channel = message.channel as TextChannel;
		const guild = channel.guild;

		if (!this.shouldProcess(guild, message.member || message.author, message)) {
			return;
		}

		const cacheKey = `${guild.id}-${message.author.id}`;
		const msgs = this.messageCache.get(cacheKey);

		this.messageCache.set(cacheKey, (msgs || []).concat(this.getMiniMessage(message)));

		const settings = await this.guilds.get(guild);
		const allViolations: Set<Violation> = new Set(Object.values(Violation));

		for (const violation of allViolations) {
			if (settings.autoMod[violation] !== true) {
				continue;
			}

			const func = this.automodFunctions[violation];

			if (!func) {
				continue;
			}

			const foundViolation = await func(guild, message, settings);

			if (!foundViolation) {
				continue;
			}

			message.delete().catch(() => undefined);

			await this.mod.sendWarnMessage(message, violation, settings);

			await this.mod.addWarnAndPunish(guild, message, violation, settings, null, [
				{ name: 'Reason', value: 'Automod' },
				{ name: 'Channel', value: channel.name },
				{ name: 'Message', value: message.content }
			]);
			return;
		}
	}

	private async shouldProcess(guild: Guild, user: User | Member, message: Message) {
		if (user.bot) {
			return;
		}

		if (!guild) {
			return;
		}

		const settings = await this.guilds.get(guild);

		if (Object.values(settings.autoMod).every((b) => b === false)) {
			return;
		}

		if (settings.autoModIgnoreChannels.has(message.channel.id)) {
			return;
		}

		if (message.member.roles.some((x) => settings.autoModIgnoreRoles.has(x))) {
			return;
		}

		return true;
	}

	private async invites(guild: Guild, message: Message, settings: BaseSettings): Promise<boolean> {
		const regex = new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/);
		const hasInviteLink = regex.test(message.content);

		return hasInviteLink;
	}

	private async allCaps(guild: Guild, message: Message, settings: BaseSettings): Promise<boolean> {
		const minCharacters = 5;
		const percentageCaps = 0.5;

		if (message.content.length < minCharacters) {
			return false;
		}

		const numUppercase = message.content.length - message.content.replace(/[A-ZА-Я]/g, '').length;
		return numUppercase / message.content.length > percentageCaps;
	}

	private async zalgoDetect(guild: Guild, message: Message, settings: BaseSettings): Promise<boolean> {
		const hasZalgo = (txt: string) => /%CC%/g.test(encodeURIComponent(txt));
		return hasZalgo(message.content.trim());
	}

	private async emojis(guild: Guild, message: Message, settings: BaseSettings): Promise<boolean> {
		return this.mod.countEmojis(message) >= 5;
	}

	private async duplicateText(guild: Guild, message: Message, settings: BaseSettings): Promise<boolean> {
		const timeframe = 60 * 1000;

		let cached = this.messageCache.get(`${guild.id}-${message.author.id}`);

		if (cached.length === 1) {
			return false;
		}

		new Map().keys;

		cached = cached.filter(
			(m) =>
				m.id !== message.id &&
				m.author === message.author.id &&
				m.content.toLowerCase() === message.content.toLowerCase() &&
				moment().diff(m.createdAt, 'second') < timeframe
		);
		return cached.length >= 2;
	}

	private async externalLinks(guild: Guild, message: Message, settings: BaseSettings): Promise<boolean> {
		const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.\w{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		const matches = message.content.match(LINK_REGEX);
		const hasLinks = matches && matches.length > 0;

		return hasLinks;
	}

	private async mentions(guild: Guild, message: Message, settings: BaseSettings): Promise<boolean> {
		return message.mentions.length > 3 || message.roleMentions.length > 2;
	}

	private getMiniMessage(message: Message): MiniMessage {
		return {
			id: message.id,
			author: message.author.id,
			createdAt: message.createdAt,
			content: message.content,
			mentions: message.mentions.length,
			roleMentions: message.roleMentions.length
		};
	}
}
