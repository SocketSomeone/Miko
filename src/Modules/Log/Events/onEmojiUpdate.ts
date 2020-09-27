import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Emoji } from 'eris';
import { Images } from '../../../Misc/Enums/Images';

export default class onEmojiUpdateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.EMOJI_UPDATE);

		client.on('guildEmojisUpdate', this.onHandle.bind(this));
	}

	private onHandle(guild: Guild, newEmojisArr: Emoji[], oldEmojisArr: Emoji[]) {
		const emojis = newEmojisArr.filter((e) => {
			const old = oldEmojisArr.find((x) => x.id === e.id);

			if (!old) {
				return false;
			}

			if (old.name === e.name) {
				return false;
			}

			return true;
		});

		emojis.map(
			async (emoji) =>
				await super.handleEvent(
					guild,
					emoji,
					oldEmojisArr.find((old) => old.id === emoji.id)
				)
		);
	}

	public async execute(t: TranslateFunc, guild: Guild, newEmoji: Emoji, oldEmoji: Emoji) {
		const compare = this.compare(newEmoji, oldEmoji);

		const embed = this.messages.createEmbed({
			author: { name: t('logs.emojiUpdate'), icon_url: Images.EMOJI_UPDATE },
			color: Color.YELLOW,
			fields: [
				{
					name: t('logs.emoji'),
					value: this.emoji(newEmoji),
					inline: true
				},
				{
					name: t('logs.edited'),
					value: compare.map((x) => `${x.key}: ${x.old} → ${x.new}`).join('\n'),
					inline: true
				}
			],
			footer: this.footer(newEmoji)
		});

		const entry = await this.getAuditLog(guild, newEmoji, Constants.AuditLogActions.EMOJI_UPDATE);

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
