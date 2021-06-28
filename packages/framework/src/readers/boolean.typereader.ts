import type { CommandContext } from '../helpers';
import { BaseTypeReader } from './base/typereader.base';

export class BooleanTypeReader extends BaseTypeReader<Boolean> {
	private trueList = new Set(['true', 'on', 'y', 'yes', 'enable', '+', 'да', 'вкл', 'включить', '1']);

	private falseList = new Set(['false', 'off', 'n', 'no', 'disable', '-', 'нет', 'выкл', 'выключить', '0']);

	public async read(context: CommandContext, input: string): Promise<Boolean> {
		if (typeof input === typeof undefined) {
			return;
		}

		const lowerInput = input.toLowerCase();

		if (this.trueList.has(lowerInput)) {
			return true;
		}

		if (this.falseList.has(lowerInput)) {
			return false;
		}
	}
}
