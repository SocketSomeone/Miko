/* eslint-disable no-restricted-globals */
import { BaseArgument } from '../models';

const MAX_VALUE = Number.MAX_SAFE_INTEGER;
const MIN_VALUE = Number.MIN_SAFE_INTEGER;

export class NumberArgument extends BaseArgument<number> {
	private min?: number;

	private max?: number;

	public constructor(min?: number, max?: number) {
		super();

		this.min = min;
		this.max = max;
	}

	public async resolve(value: string): Promise<number> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		const val = parseInt(value, 10);

		if (isNaN(val) || !isFinite(val)) {
			throw Error('Введено не правильное число!');
		}

		if (val < MIN_VALUE || val < this.min) {
			throw Error(`Введённое число не должно быть меньше ${this.min || MIN_VALUE}`);
		}
		if (val > MAX_VALUE || val > this.max) {
			throw Error(`Введённое число не должно быть больше ${this.max || MAX_VALUE}`);
		}

		return val;
	}
}
