import { BaseEventLog } from '../Others/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Others/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Member, VoiceChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';
import { Cache } from '../../../Framework/Decorators/Cache';
import { GuildSettingsCache } from '../../../Framework/Cache';

export default class onVoiceConnectEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.VOICE_JOIN);

		client.on('voiceChannelJoin', this.onVoiceChannelJoin.bind(this));
	}

	private async onVoiceChannelJoin(member: Member, channel: VoiceChannel) {
		const sets = await this.guilds.get(channel.guild);

		if (sets.privateManager === channel.id) return;

		await super.handleEvent(channel.guild, member, channel);
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member, channel: VoiceChannel) {
		const embed = this.messages.createEmbed({
			author: { name: t('logs.voiceConnected'), icon_url: Images.VOICE_JOIN },
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
