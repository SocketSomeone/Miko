import { BaseService } from '../../../Framework/Services/Service';
import { Member, VoiceChannel, Guild, PermissionOverwrite } from 'eris';
import { ChannelType, ChannelOptions } from '../../../Types';

import { PrivatesCache } from '../Cache/PrivateCache';
import { Moment } from 'moment';
import moment from 'moment';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { BasePrivate } from '../../../Entity/Privates';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import PermissionResolver, { Permissions } from '../../../Misc/Utils/PermissionResolver';

export class PrivateService extends BaseService {
	protected ratelimit: Map<string, Moment> = new Map();
	protected cache: PrivatesCache;

	public async init() {
		this.cache = new PrivatesCache(this.client);

		this.client.on('voiceChannelSwitch', this.onSwitch.bind(this));
		this.client.on('voiceChannelLeave', this.onLeave.bind(this));
		this.client.on('voiceChannelJoin', this.onJoin.bind(this));
	}

	private async onSwitch(member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) {
		const guild = member.guild;
		const sets = await this.client.cache.guilds.get(guild.id);
		const pr = await this.cache.get(oldChannel.id);

		const isRatelimited = this.ratelimit.has(member.id) && moment().isBefore(this.ratelimit.get(member.id));

		if (sets.privateManager && newChannel.id === sets.privateManager && !isRatelimited) {
			this.ratelimit.set(member.id, moment().add(5, 'seconds'));

			if (
				pr !== undefined &&
				pr !== null &&
				pr.owner === member.id &&
				oldChannel.voiceMembers.filter((x) => !x.user.bot).length < 1
			) {
				await member
					.edit({
						channelID: pr.id
					})
					.catch(() => undefined);
			} else {
				await this.createRoom(member, guild, newChannel).catch(() => undefined);
			}

			return;
		}

		if (oldChannel.voiceMembers.filter((x) => !x.user.bot).length > 0) return;

		if (pr === null) return;

		oldChannel.delete('Empty private room').catch(() => undefined);
		await this.cache.delete(pr);
	}

	private async onJoin(member: Member, channel: VoiceChannel) {
		const isRatelimited = this.ratelimit.has(member.id) && moment().isBefore(this.ratelimit.get(member.id));

		if (isRatelimited) return;

		const guild = member.guild;
		const sets = await this.client.cache.guilds.get(guild.id);

		if (!sets.privateManager || channel.id !== sets.privateManager) return;

		await this.createRoom(member, guild, channel).catch(() => undefined);
	}

	private async onLeave(member: Member, channel: VoiceChannel) {
		if (channel.voiceMembers.filter((x) => !x.user.bot).length > 0) return;

		const pr = await this.cache.get(channel.id);

		if (pr === null) return;

		channel.delete('Empty private room').catch(() => undefined);
		await this.cache.delete(pr);
	}

	protected async createRoom(member: Member, guild: Guild, channel: VoiceChannel) {
		this.ratelimit.set(member.id, moment().add(5, 'seconds'));

		const house = await guild.createChannel(`🏡 ${member.username}`, ChannelType.GUILD_VOICE, {
			parentID: channel.parentID,
			userLimit: 2,
			permissionOverwrites: [
				{
					id: guild.id,
					type: 'role',
					allow: 0,
					deny: PermissionResolver(GuildPermission.MANAGE_ROLES)
				},
				{
					id: member.id,
					type: 'member',
					allow: PermissionResolver(
						GuildPermission.CONNECT,
						GuildPermission.SPEAK,
						GuildPermission.VIEW_CHANNEL,
						GuildPermission.MANAGE_CHANNELS,
						GuildPermission.USE_PRIORITY_SPEAKER
					),
					deny: 0
				},
				{
					id: this.client.user.id,
					type: 'member',
					allow: PermissionResolver(GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_ROLES),
					deny: 0
				}
			]
		});

		try {
			await member.edit({
				channelID: house.id
			});

			await this.cache.add({
				id: house.id,
				owner: member.id
			});
		} catch (err) {
			house.delete().catch(() => undefined);
		}
	}

	public async getRoomByVoice(t: TranslateFunc, voice: string) {
		if (typeof voice === 'undefined') throw new ExecuteError(t('voice.error.notFound'));

		const room = await this.cache.get(voice);

		if (!room) throw new ExecuteError(t('voice.error.notFound'));

		return room;
	}
}
