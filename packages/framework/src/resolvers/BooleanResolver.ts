import { BaseResolver } from '../models';

const ts = new Set(['true', 'on', 'y', 'yes', 'enable', 'вкл', 'включить']);
const fs = new Set(['false', 'off', 'n', 'no', 'disable', 'выкл', 'выключить']);

export class BooleanResolver extends BaseResolver<boolean> {
	public async resolve(_value: string): Promise<boolean> {
		if (typeof _value === typeof undefined) {
			return;
		}

		const value = _value.toLowerCase();

		if (ts.has(value)) {
			return true;
		}

		if (fs.has(value)) {
			return false;
		}

		throw Error('Не удалось');
	}
}
