import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Member, VoiceChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onVoiceSwitchEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.VOICE_SWITCH);

		client.on('voiceChannelSwitch', this.onHandle.bind(this));
	}

	private async onHandle(member: Member, channel: VoiceChannel, oldChannel: VoiceChannel, isCreated: boolean) {
		const guild = channel.guild;

		if (!guild) {
			return;
		}

		const sets = await this.client.cache.guilds.get(guild);

		if (sets.privateManager === channel.id && isCreated !== true) return;

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
			author: { name: t('logs.voiceSwitch'), icon_url: Images.VOICE_SWITCH },
			color: Color.YELLOW,
			fields: [
				{
					name: t('logs.channel'),
					value: `\`${oldChannel.name}\` → \`${newChannel.name}\``,
					inline: true
				},
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL },
			footer: {
				text: `From: ${oldChannel.id}, To: ${newChannel.id}`
			}
		});

		return embed;
	}
}
