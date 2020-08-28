import { EmbedOptions } from 'eris';
import { Color } from './Misc/Enums/Colors';

export enum ChannelType {
	GUILD_TEXT = 0,
	DM = 1,
	GUILD_VOICE = 2,
	GROUP_DM = 3,
	GUILD_CATEGORY = 4
}

export interface ChannelOptions {
	name?: string;
	topic?: string;
	bitrate?: number;
	userLimit?: number;
	rateLimitPerUser?: number;
	nsfw?: boolean;
	parentID?: string;
}

export type Modify<T, R> = Omit<T, keyof R> & R;

export type BaseEmbedOptions = Modify<EmbedOptions, { color?: number | Color }>;
