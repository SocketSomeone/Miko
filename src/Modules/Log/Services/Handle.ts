import { BaseService } from '../../../Framework/Services/Service';
import { BaseClient } from '../../../Client';
import { ProcessingLogs, ProcessFuncs } from './Proccessing';
import {
	Guild,
	GuildChannel,
	AnyChannel,
	Emoji,
	TextChannel,
	Member,
	VoiceChannel,
	Embed,
	EmbedOptions,
	Message,
	PrivateChannel,
	GroupChannel
} from 'eris';
import { captureException, withScope } from '@sentry/node';

import i18n from 'i18n';
import { TranslateFunc } from '../../../Framework/Commands/Command';

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
	ROLE_DELETE,

	VOICE_JOIN,
	VOICE_SWITCH,
	VOICE_LEAVE,

	MEMBER_JOIN,
	MEMBER_LEAVE,
	MEMBER_UPDATE_ROLES,

	MESSAGE_EDITED,
	MESSAGE_DELETED
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
		this.client.on('guildMemberUpdate', this.handleByMemberUpdate.bind(this));

		this.client.on('guildRoleCreate', this.handle.bind(this, LogType.ROLE_CREATE));
		this.client.on('guildRoleUpdate', this.handle.bind(this, LogType.ROLE_UPDATE));
		this.client.on('guildRoleDelete', this.handle.bind(this, LogType.ROLE_DELETE));

		this.client.on('voiceChannelJoin', this.handleByVoice.bind(this, LogType.VOICE_JOIN));
		this.client.on('voiceChannelLeave', this.handleByVoice.bind(this, LogType.VOICE_LEAVE));
		this.client.on('voiceChannelSwitch', this.handleByVoice.bind(this, LogType.VOICE_SWITCH));

		this.client.on('guildMemberAdd', this.handle.bind(this, LogType.MEMBER_JOIN));
		this.client.on('guildMemberRemove', this.handle.bind(this, LogType.MEMBER_LEAVE));

		this.client.on('messageUpdate', this.handleByMessage.bind(this, LogType.MESSAGE_EDITED));
		this.client.on('messageDelete', this.handleByMessage.bind(this, LogType.MESSAGE_DELETED));
	}

	private async handle(type: LogType, guild: Guild, ...args: any[]) {
		if (!guild) {
			return;
		}

		const sets = await this.client.cache.guilds.get(guild.id);

		// if (sets.logger[type] === null) {
		// 	return;
		// };

		const channel = guild.channels.get('746183455347572756') as TextChannel;
		const process = this.processing[type];

		if (!channel || process === null) {
			return;
		}

		const t: TranslateFunc = (phrase, replacements) => i18n.__({ locale: sets.locale, phrase }, replacements);

		try {
			const embed: Embed = await process(t, guild, ...args);

			if (!embed) {
				return;
			}

			await this.client.messages.sendEmbed(channel, t, embed);
		} catch (err) {
			if (err.message === 'ignore') {
				return;
			}

			console.error(err);

			withScope((scope) => {
				scope.setTag('log action', String(type));
				scope.setExtra('guild', guild.id);

				captureException(err);
			});
		}
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

			if (old.name === e.name) {
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

	protected handleByVoice(type: LogType, member: Member, channel?: VoiceChannel, oldChannel?: VoiceChannel) {
		const guild = channel.guild;

		if (!guild) {
			return;
		}

		this.handle(type, guild, member, channel, oldChannel);
	}

	protected handleByMemberUpdate(guild: Guild, member: Member, oldMember: { roles: string[]; nickname?: string }) {
		if (!oldMember) return;

		if (member.roles !== oldMember.roles) {
			this.handle(LogType.MEMBER_UPDATE_ROLES, guild, member, oldMember.roles);
		}

		return;
	}

	protected handleByMessage(type: LogType, message: Message, oldMessage?: Message) {
		if (oldMessage && !message.editedTimestamp) return;

		if (message.channel instanceof PrivateChannel || message.channel instanceof GroupChannel) return;

		if (!message.member) return;

		const guild = (message.channel as TextChannel).guild;

		if (!guild || message.member.bot) {
			return;
		}

		return this.handle(type, guild, message, oldMessage);
	}
}
