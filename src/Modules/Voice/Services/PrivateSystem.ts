import { BaseService } from '../../../Framework/Services/Service';
import { Member, VoiceChannel, Guild } from 'eris';
import { ChannelType } from '../../../Types';
import { PrivatesCache } from '../Cache/PrivateCache';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import PermissionResolver from '../../../Misc/Utils/PermissionResolver';

export class PrivateService extends BaseService {
	protected cache: PrivatesCache;

	public async init() {
		this.cache = this.client.cache.rooms;

		this.client.on('voiceChannelSwitch', this.onSwitch.bind(this));
		this.client.on('voiceChannelLeave', this.onLeave.bind(this));
		this.client.on('voiceChannelJoin', this.onJoin.bind(this));
	}

	private async onSwitch(member: Member, newChannel: VoiceChannel, oldChannel: VoiceChannel) {
		if (!newChannel || !oldChannel) return;

		const guild = member.guild;

		const sets = await this.client.cache.guilds.get(guild);
		const rooms = await this.cache.get(guild);

		if (newChannel.id === sets.privateManager) {
			if (
				rooms.has(oldChannel.id) &&
				rooms.get(oldChannel.id).owner === member.id &&
				oldChannel.voiceMembers.filter((x) => !x.user.bot).length < 1
			) {
				await this.moveMember(member, newChannel, oldChannel);
			} else {
				await this.createRoom(member, guild, newChannel).catch(() => undefined);
			}

			return;
		}

		await this.onLeave(member, oldChannel);
	}

	private async onJoin(member: Member, channel: VoiceChannel) {
		const guild = member.guild;
		const sets = await this.client.cache.guilds.get(guild);

		if (channel.id !== sets.privateManager) return;

		await this.createRoom(member, guild, channel).catch(() => undefined);
	}

	private async onLeave(member: Member, channel: VoiceChannel) {
		if (channel.voiceMembers.filter((x) => !x.user.bot).length > 0) return;

		const rooms = await this.cache.get(member.guild);

		if (!rooms.has(channel.id)) return;

		this.client.emit('roomDelete', member, channel);
		await this.cache.delete(channel);
	}

	private async createRoom(member: Member, guild: Guild, channel: VoiceChannel) {
		const house = await guild
			.createChannel(`🏡 ${member.username}`, ChannelType.GUILD_VOICE, {
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
			})
			.catch(() => undefined);

		await this.cache.add({
			id: house.id,
			guild: guild.id,
			owner: member.id
		});

		this.client.emit('roomCreate', member, house);
		await this.moveMember(member, channel, house);
	}

	private async moveMember(member: Member, manager: VoiceChannel, house: VoiceChannel) {
		try {
			await member.edit({
				channelID: house.id
			});

			await this.lockManager(member, manager).catch(() => undefined);
		} catch (err) {
			await this.cache.delete(house);
		}
	}

	private async lockManager(member: Member, manager: VoiceChannel) {
		await this.client.editChannelPermission(
			manager.id,
			member.id,
			0,
			PermissionResolver(GuildPermission.CONNECT),
			'member'
		);
		await sleep(5000);
		await this.client.deleteChannelPermission(manager.id, member.id);
	}

	public async getRoomByVoice(t: TranslateFunc, guild: Guild, voice: string) {
		if (!voice) throw new ExecuteError(t('voice.error.notFound'));

		const rooms = await this.cache.get(guild);
		const room = rooms.get(voice);

		if (!(room === null || room === undefined)) throw new ExecuteError(t('voice.error.notFound'));

		return room;
	}
}
