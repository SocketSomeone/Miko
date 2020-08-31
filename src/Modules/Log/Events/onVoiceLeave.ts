import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Member, VoiceChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onVoiceLeaveEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.VOICE_LEAVE);

		client.on('voiceChannelLeave', this.onChannelLeave.bind(this));
	}

	private async onChannelLeave(member: Member, channel: VoiceChannel) {
		const guild = member.guild;
		const rooms = await this.client.cache.rooms.get(guild);

		if (rooms.has(channel.id)) return;

		await super.handleEvent(guild, member, channel);
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member, channel: VoiceChannel, isRoom: boolean) {
		const embed = this.client.messages.createEmbed({
			author: { name: isRoom ? t('logs.roomDeleted') : t('logs.voiceLeaved'), icon_url: Images.VOICE_LEAVE },
			color: Color.RED,
			fields: [
				{
					name: t('logs.channel'),
					value: `\`${channel.name}\``,
					inline: true
				},
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL },
			footer: this.footer(channel)
		});

		return embed;
	}
}
