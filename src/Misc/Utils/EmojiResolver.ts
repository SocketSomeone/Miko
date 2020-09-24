import { Guild } from 'eris';
import { DISCORD_EMOJI_REGEX, EMOJIS_REGEX } from '../Regex/Emoji';
import { EmojisDefault } from '../Enums/EmojisDefaults';

export default (emoji: string, guild: Guild) => {
	if (Object.values(EmojisDefault).some((x) => x === emoji)) return emoji;

	if (DISCORD_EMOJI_REGEX.test(emoji)) {
		const matches = emoji.match(DISCORD_EMOJI_REGEX);

		const hasEmoji = guild.emojis.find((x) => x.name === matches[1] && x.id === matches[2]);

		if (!hasEmoji) {
			return EmojisDefault.UNKNOWN_EMOJI;
		}

		return `<${hasEmoji.animated ? 'a' : ''}:${hasEmoji.name}:${hasEmoji.id}>`;
	}

	if (!emoji.match(EMOJIS_REGEX)) {
		return EmojisDefault.UNKNOWN_EMOJI;
	}

	return emoji;
};
