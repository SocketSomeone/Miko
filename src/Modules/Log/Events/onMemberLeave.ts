import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role, Member } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onMemberLeaveEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.MEMBER_LEAVE);

		client.on('guildMemberRemove', super.handleEvent.bind(this));
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.guildLeave'), icon_url: Images.MEMBER_LEAVE },
			color: Color.RED,
			fields: [
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL },
			footer: this.footer(member)
		});

		return embed;
	}
}
