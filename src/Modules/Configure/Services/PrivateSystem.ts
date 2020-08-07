import { BaseService } from '../../../Framework/Services/Service';
import { Member, VoiceChannel, Guild } from 'eris';
import { ChannelType } from '../../../Types';

import { PrivatesCache } from '../Cache/PrivateCache';
import { Moment } from 'moment';
import moment from 'moment';

export class PrivateService extends BaseService {
	protected ratelimit: Map<string, Moment> = new Map();
	protected cache: PrivatesCache;

	public async init() {
		this.cache = new PrivatesCache(this.client);

		await this.onClientReady();
	}

	public async onClientReady() {
		this.client.on('voiceChannelSwitch', this.onSwitch.bind(this));
		this.client.on('voiceChannelLeave', this.onLeave.bind(this));
		this.client.on('voiceChannelJoin', this.onJoin.bind(this));

		await super.onClientReady();
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
				member
					.edit({
						channelID: pr.id
					})
					.catch(() => undefined);
			} else {
				this.createRoom(member, guild, newChannel).catch(() => undefined);
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

		this.createRoom(member, guild, channel).catch(() => undefined);
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

		const house = await guild.createChannel(`🏡 Домик ${member.username}`, ChannelType.GUILD_VOICE, {
			parentID: channel.parentID,
			userLimit: 2
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
}
