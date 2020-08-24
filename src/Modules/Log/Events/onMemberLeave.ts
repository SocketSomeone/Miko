import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role, Member } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

export default class onMemberLeaveEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.MEMBER_LEAVE);

		client.on('guildMemberRemove', super.handleEvent.bind(this));
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.guildLeave') },
			color: ColorResolve(Color.RED),
			fields: [
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}
}
