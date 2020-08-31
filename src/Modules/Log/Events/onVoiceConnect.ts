import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Member, VoiceChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onVoiceConnectEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.VOICE_JOIN);

		client.on('voiceChannelJoin', this.onHandle.bind(this));
	}

	private async onHandle(member: Member, channel: VoiceChannel) {
		const guild = channel.guild;

		if (!guild) {
			return;
		}

		const sets = await this.client.cache.guilds.get(guild);

		await super.handleEvent(guild, member, channel, sets.privateManager === channel.id);
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member, channel: VoiceChannel, room: boolean) {
		const embed = this.client.messages.createEmbed({
			author: { name: room ? t('roomCreated') : t('logs.voiceConnected'), icon_url: Images.VOICE_JOIN },
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
