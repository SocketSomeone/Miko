export interface IGiftItem {
	raw: string;
	name: string;
	cost: number;
}

const translate = 'waifu.gifts.fields.';

export const Gifts: IGiftItem[] = [
	{
		raw: '💋',
		name: `${translate}kiss`,
		cost: 3
	},
	{
		raw: '💕',
		name: `${translate}hearts`,
		cost: 10
	},
	{
		raw: '🌸',
		name: `${translate}flower`,
		cost: 45
	},
	{
		raw: '🐱',
		name: `${translate}cat`,
		cost: 70
	},
	{
		raw: '🍉',
		name: `${translate}melon`,
		cost: 85
	},
	{
		raw: '🎂',
		name: `${translate}cake`,
		cost: 250
	},
	{
		raw: '☕',
		name: `${translate}coffe`,
		cost: 110
	},
	{
		raw: '🍺',
		name: `${translate}beer`,
		cost: 270
	},
	{
		raw: '🎀',
		name: `${translate}bow`,
		cost: 230
	},
	{
		raw: '✨',
		name: `${translate}stars`,
		cost: 350
	},
	{
		raw: '💍',
		name: `${translate}ring`,
		cost: 300
	},
	{
		raw: '👑',
		name: `${translate}crown`,
		cost: 500
	}
];
