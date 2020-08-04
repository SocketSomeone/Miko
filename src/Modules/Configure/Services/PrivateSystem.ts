import { BaseService } from '../../../Framework/Services/Service';
import { Member, VoiceChannel } from 'eris';
import { ChannelType } from '../../../Types';

import { PrivatesCache } from '../Cache/PrivateCache';

const RATE_LIMIT = 1;
const COOLDOWN = 5;

export class PrivateService extends BaseService {
	private cachedRooms: Set<string> = new Set();
	protected cache: PrivatesCache;

	public async init() {
		this.cache = new PrivatesCache(this.client);

		await this.onClientReady();
	}

	public async onClientReady() {
		this.client.on('voiceChannelJoin', this.onJoin.bind(this));
		this.client.on('voiceChannelSwitch', this.onJoin.bind(this));

		this.client.on('voiceChannelLeave', this.onLeave.bind(this));
		//this.client.on('voiceChannelSwitch', this.onLeave)

		await super.onClientReady();
	}

	private async onJoin(member: Member, channel: VoiceChannel) {
		const guild = member.guild;
		const sets = await this.client.cache.guilds.get(guild.id);

		if (!sets.privateManager || channel.id !== sets.privateManager) return;

		const house = await guild.createChannel(`🏡 Домик ${member.username}`, ChannelType.GUILD_VOICE, {
			parentID: channel.parentID,
			userLimit: 2
		});

		this.cachedRooms.add(house.id);

		await member.edit({
			channelID: house.id
		});
	}

	protected async onLeave(member: Member, channel: VoiceChannel) {
		if (!this.cachedRooms.has(channel.id)) {
			const isPrivate = await this.cache.get(channel.id);

			if (!isPrivate) return;
		}

		if (channel.voiceMembers.filter((x) => !x.user.bot).length > 1) return;

		channel.delete('Empty private room').catch(() => undefined);
		this.cachedRooms.delete(channel.id);
	}
}
