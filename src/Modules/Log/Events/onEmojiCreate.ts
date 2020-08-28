import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Emoji } from 'eris';
import { Images } from '../../../Misc/Enums/Images';

export default class onEmojiCreateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.EMOJI_CREATE);

		client.on('guildEmojisUpdate', this.onHandle.bind(this));
	}

	private onHandle(guild: Guild, newEmojisArr: Emoji[], oldEmojisArr: Emoji[]) {
		const emojis = newEmojisArr.filter((e) => !oldEmojisArr.find((x) => x.id === e.id));

		emojis.map(async (emoji) => await super.handleEvent(guild, emoji));
	}

	public async execute(t: TranslateFunc, guild: Guild, emoji: Emoji) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.emojiCreate'), icon_url: Images.EMOJI_CREATE },
			color: Color.LIME,
			fields: [
				{
					name: t('logs.emoji'),
					value: this.emoji(emoji),
					inline: true
				}
			]
		});

		const entry = await this.getAuditLog(guild, emoji, Constants.AuditLogActions.EMOJI_CREATE);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}
}
