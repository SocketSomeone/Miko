import { Punishment } from '../../Entity/Punishment';

export interface GuildPrices {
	timely: string;
	standart: string;
}

export interface GuildEmojis {
	wallet: string;
}

export interface GuildSettings {
	prefix: string;
	locale: Lang;
	ignoreChannels: string[];
	prices: GuildPrices;
	verbose: boolean;
	emojis: GuildEmojis;

	modlog: string;
	saveroles: boolean;
	mutedRole: string;

	autoMod: {
		enabled: boolean;
		invites: Punishment;
	};
}

export enum Lang {
	ru = 'ru'
}

export enum EmojisDefault {
	UNKNOWN = '<:unknown_emoji:735361731580264448>',
	WALLET = '<:miko_coins:735507574027190303>'
}

export const Defaults: GuildSettings = {
	prefix: '#',
	locale: Lang.ru,
	ignoreChannels: [],
	verbose: true,
	saveroles: false,
	modlog: null,
	mutedRole: null,
	prices: {
		timely: '15',
		standart: '100'
	},
	emojis: {
		wallet: EmojisDefault.WALLET
	},
	autoMod: {
		enabled: true,
		invites: Punishment.IGNORE
	}
};
