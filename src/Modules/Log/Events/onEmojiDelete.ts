import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Services/Commands/Command';
import { Guild, Constants } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Emoji } from 'eris';
import { Images } from '../../../Misc/Enums/Images';

export default class onEmojiDeleteEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.EMOJI_DELETE);

		client.on('guildEmojisUpdate', this.onHandle.bind(this));
	}

	private onHandle(guild: Guild, newEmojisArr: Emoji[], oldEmojisArr: Emoji[]) {
		const emojis = oldEmojisArr.filter((e) => !newEmojisArr.find((x) => x.id === e.id));

		emojis.map(async (emoji) => await super.handleEvent(guild, emoji));
	}

	public async execute(t: TranslateFunc, guild: Guild, emoji: Emoji) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.emojiDelete'), icon_url: Images.EMOJI_DELETE },
			color: Color.RED,
			fields: [
				{
					name: t('logs.emoji'),
					value: this.emoji(emoji),
					inline: true
				}
			],
			footer: this.footer(emoji)
		});

		const entry = await this.getAuditLog(guild, emoji, Constants.AuditLogActions.EMOJI_DELETE);

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
