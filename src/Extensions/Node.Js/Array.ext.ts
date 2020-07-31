interface Array<T> {
	enumerate(): Generator<[number, T], void, unknown>; //
	itemInRage(x: number): T; //
	chanceItem(): T;
	first(): T; //
	last(): T; //
	random(): T; //
	randomByChace(): T;
	shuffle(): Array<T>;
}

Array.prototype.enumerate = function* () {
	let i = 1;

	for (const x of this) {
		yield [i, x];

		i++;
	}
};

Array.prototype.itemInRage = function (number) {
	let item = null;

	for (const element of this) {
		if (number.range(element.range)) {
			item = element;
		}
	}

	return item;
};

Array.prototype.first = function () {
	return this.shift();
};

Array.prototype.last = function () {
	return this.pop();
};

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.shuffle = function () {
	return this.sort(() => Math.random() - 0.5);
};

Array.prototype.randomByChace = function () {
	const sorted = this.sort((a: any, b: any) => a.chance - b.chance);

	return randomByWeight(
		sorted.map((x: any) => x),
		sorted.map((x: any) => Number(x.chance))
	);
};
