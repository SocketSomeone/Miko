import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, User, Member, VoiceChannel } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

export default class onVoiceSwitchEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.VOICE_SWITCH);

		client.on('voiceChannelSwitch', this.onHandle.bind(this));
	}

	private async onHandle(member: Member, channel: VoiceChannel, oldChannel: VoiceChannel) {
		const guild = channel.guild;

		if (!guild) {
			return;
		}

		await super.handleEvent(guild, member, channel, oldChannel);
	}

	public async execute(
		t: TranslateFunc,
		guild: Guild,
		member: Member,
		newChannel: VoiceChannel,
		oldChannel: VoiceChannel
	) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.voiceSwitch') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.channel'),
					value: `\`${oldChannel.name}\` -> \`${newChannel.name}\``,
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
