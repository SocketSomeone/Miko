import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, User, Member, VoiceChannel } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

export default class onVoiceLeaveEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.VOICE_LEAVE);

		client.on('voiceChannelLeave', this.onHandle.bind(this));
	}

	private async onHandle(member: Member, channel: VoiceChannel) {
		const guild = channel.guild;

		if (!guild) {
			return;
		}

		await super.handleEvent(guild, member, channel);
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member, channel: VoiceChannel) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.voiceLeaved') },
			color: ColorResolve(Color.RED),
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
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}
}
