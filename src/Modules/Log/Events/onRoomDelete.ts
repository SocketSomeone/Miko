import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Services/Commands/Command';
import { Guild, Member, VoiceChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onPrivateDeleteEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.ROOM_DELETE);

		client.on('roomDelete', this.onPrivateDelete.bind(this));
	}

	private async onPrivateDelete(member: Member, channel: VoiceChannel) {
		await super.handleEvent(member.guild, member, channel, true);
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member, channel: VoiceChannel) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.roomDeleted'), icon_url: Images.VOICE_LEAVE },
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
