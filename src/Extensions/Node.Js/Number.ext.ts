interface Number {
	range(range: number[]): boolean;
	isChance(): boolean;
}

Number.prototype.range = function (range) {
	return range[0] <= this && range[1] > this;
};
