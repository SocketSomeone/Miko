import BigNumber from 'bignumber.js';
import { Punishment } from '../../Entity/Punishment';
import { Violation } from './Violation';

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
	autoassignRole: string;

	privateManager: string;
	autoModIgnoreRoles: string[];
	autoModIgnoreChannels: string[];
	autoMod: {
		[key in Violation]: boolean;
	};
}

export enum Lang {
	ru = 'ru'
}

export enum EmojisDefault {
	UNKNOWN = '<:unknown_emoji:735361731580264448>',
	WALLET = '<:miko_coins:735507574027190303>',
	ENABLED = '<:enabled:740536635833188352>',
	DISABLED = '<:disabled:740536635762016277>'
}

export const Defaults: GuildSettings = {
	prefix: '!',
	locale: Lang.ru,
	ignoreChannels: [],
	verbose: true,
	saveroles: false,
	modlog: null,
	mutedRole: null,
	autoassignRole: null,
	privateManager: null,
	prices: {
		timely: '15',
		standart: '100'
	},
	emojis: {
		wallet: EmojisDefault.WALLET
	},
	autoModIgnoreRoles: [],
	autoModIgnoreChannels: [],
	autoMod: {
		[Violation.invites]: false,
		[Violation.allCaps]: false,
		[Violation.duplicateText]: false,
		[Violation.zalgo]: false,
		[Violation.emojis]: false,
		[Violation.externalLinks]: false,
		[Violation.mentions]: false
	}
};
