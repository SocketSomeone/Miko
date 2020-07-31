const { Chance } = require('chance');

const chance = new Chance(Math.random);

declare var sleep: (ms: number) => Promise<unknown>;

sleep = async function (ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

declare var randomByWeight: (arr: Array<any>, percent: number[]) => any;

randomByWeight = function (arr, percent) {
	return chance.weighted(arr, percent);
};
