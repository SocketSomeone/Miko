import { BaseService } from '../../../Framework/Services/Service';
import { BaseClient } from '../../../Client';
import { ProcessingLogs, ProcessFuncs } from './Proccessing';
import { Guild, GuildChannel, AnyChannel, Emoji, TextChannel } from 'eris';

export enum LogType {
	BAN,
	UNBAN,

	CHANNEL_CREATE,
	CHANNEL_DELETE,

	EMOJI_CREATE,
	EMOJI_UPDATE,
	EMOJI_DELETE,

	ROLE_CREATE,
	ROLE_UPDATE,
	ROLE_DELETE
}

export class LoggingService extends BaseService {
	private processing: ProcessFuncs;

	public constructor(client: BaseClient) {
		super(client);

		this.processing = new ProcessingLogs(client).funcs;
	}

	public async init() {
		this.client.on('guildBanAdd', this.handle.bind(this, LogType.BAN));
		this.client.on('guildBanRemove', this.handle.bind(this, LogType.UNBAN));

		this.client.on('channelCreate', this.handleByChannel.bind(this, LogType.CHANNEL_CREATE));
		this.client.on('channelDelete', this.handleByChannel.bind(this, LogType.CHANNEL_DELETE));

		this.client.on('guildEmojisUpdate', this.handleEmojis.bind(this));

		this.client.on('guildRoleCreate', this.handle.bind(this, LogType.ROLE_CREATE));
		this.client.on('guildRoleUpdate', this.handle.bind(this, LogType.ROLE_UPDATE));
		this.client.on('guildRoleDelete', this.handle.bind(this, LogType.ROLE_DELETE));
	}

	private async handle(type: LogType, guild: Guild, ...args: any[]) {
		const sets = await this.client.cache.guilds.get(guild.id);

		if (sets.logger[type] === null) {
			return;
		}

		const channel = guild.channels.get(sets.logger[type]) as TextChannel;
		const process = this.processing[type];

		if (process === null) {
			return;
		}

		await process(channel, args);
	}

	protected handleByChannel(type: LogType, c: AnyChannel) {
		const guild = (c as GuildChannel).guild;

		if (!guild) {
			return;
		}

		this.handle(type, guild, c);
	}

	protected handleEmojis(guild: Guild, newEmojisArr: Emoji[], oldEmojisArr: Emoji[]) {
		const createdEmojis = newEmojisArr.filter((e) => !oldEmojisArr.find((x) => x.id === e.id));
		const deletedEmojis = oldEmojisArr.filter((e) => !newEmojisArr.find((x) => x.id === e.id));
		const editedEmojis = newEmojisArr.filter((e) => {
			const old = oldEmojisArr.find((x) => x.id === e.id);

			if (!old) {
				return false;
			}

			const isEqual = Object.entries(e).toString() === Object.entries(old).toString();

			if (isEqual) {
				return false;
			}

			return true;
		});

		createdEmojis.map((emoji) => this.handle(LogType.EMOJI_CREATE, guild, emoji));
		deletedEmojis.map((emoji) => this.handle(LogType.EMOJI_DELETE, guild, emoji));
		editedEmojis.map((emoji) =>
			this.handle(
				LogType.EMOJI_UPDATE,
				guild,
				emoji,
				oldEmojisArr.find((old) => old.id === emoji.id)
			)
		);
	}
}
