import type { Guild, GuildPreview } from 'discord.js';

export interface IGuildInfoRequest {
	guildId: string;
	preview: boolean;
}

export type GuildInfoDTO = Guild | GuildPreview | { id: null };
