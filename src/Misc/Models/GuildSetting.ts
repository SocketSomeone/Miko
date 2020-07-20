export interface GuildSettings {
	prefix: string;
	locale: Lang;
	ignoreChannels: string[];
	verbose: boolean;
}

export enum Lang {
	ru = 'ru'
}

export const Defaults: GuildSettings = {
	prefix: '#',
	locale: Lang.ru,
	ignoreChannels: [],
	verbose: true
};
