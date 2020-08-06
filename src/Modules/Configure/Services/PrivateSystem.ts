import { BaseService } from '../../../Framework/Services/Service';
import { Member, VoiceChannel } from 'eris';
import { ChannelType } from '../../../Types';

import { PrivatesCache } from '../Cache/PrivateCache';
import { Moment } from 'moment';
import moment from 'moment';

const RATE_LIMIT = 1;
const COOLDOWN = 5;

export class PrivateService extends BaseService {
	protected recently: Map<string, Moment> = new Map();
	protected cache: PrivatesCache;

	public async init() {
		this.cache = new PrivatesCache(this.client);

		await this.onClientReady();
	}

	public async onClientReady() {
		this.client.on('voiceChannelLeave', this.onLeave.bind(this));

		this.client.on('voiceChannelJoin', this.onJoin.bind(this));
		this.client.on('voiceChannelSwitch', this.onJoin.bind(this));

		//this.client.on('voiceChannelSwitch', this.onLeave)

		await super.onClientReady();
	}

	private async onJoin(member: Member, channel: VoiceChannel) {
		if (this.recently.has(member.id) && moment().isBefore(this.recently.get(member.id))) return;

		const guild = member.guild;
		const sets = await this.client.cache.guilds.get(guild.id);

		if (!sets.privateManager || channel.id !== sets.privateManager) return;

		this.recently.set(member.id, moment().add(5, 'seconds'));

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

	protected async onLeave(member: Member, channel: VoiceChannel) {
		if (channel.voiceMembers.filter((x) => !x.user.bot).length > 0) return;

		const pr = await this.cache.get(channel.id);

		if (pr === null) return;

		channel.delete('Empty private room').catch(() => undefined);
		await this.cache.delete(pr);
	}
}
