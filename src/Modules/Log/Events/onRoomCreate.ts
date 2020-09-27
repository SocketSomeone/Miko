import { BaseEventLog } from '../Others/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Others/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Member, VoiceChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onRoomCreate extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.ROOM_CREATE);

		client.on('roomCreate', this.onRoomCreate.bind(this));
	}

	private async onRoomCreate(member: Member, channel: VoiceChannel) {
		await super.handleEvent(member.guild, member, channel, true);
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member, channel: VoiceChannel) {
		const embed = this.messages.createEmbed({
			author: { name: t('logs.roomCreated'), icon_url: Images.VOICE_JOIN },
			color: Color.LIME,
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
