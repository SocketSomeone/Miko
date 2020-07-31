import BigNumber from 'bignumber.js';

export interface GuildPrices {
	timely: BigNumber;
	standart: BigNumber;
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

	saveroles: boolean;
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
	prices: {
		timely: new BigNumber(15),
		standart: new BigNumber(100)
	},
	emojis: {
		wallet: EmojisDefault.WALLET
	}
};
