import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role, Member } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

export default class onMemberJoinEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.MEMBER_JOIN);

		client.on('guildMemberAdd', super.handleEvent.bind(this));
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.guildJoin') },
			color: ColorResolve(Color.GREEN),
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
