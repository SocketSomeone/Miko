import type { Guild } from 'discord.js';

export interface IGuildInfoRequest {
	guildId: string;
}

export type GuildInfoDTO = Guild | { id: null };
