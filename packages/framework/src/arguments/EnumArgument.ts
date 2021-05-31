import { BaseArgument } from '../models';

export class EnumArgument extends BaseArgument<string> {
	private values: Map<string, string>;

	public constructor(values: string[]) {
		super();

		this.values = new Map();
		values.forEach(v => this.values.set(v.toLowerCase(), v));
	}

	public async resolve(value: string): Promise<string> {
		if (!value) {
			return;
		}

		const val = value.toLowerCase();

		if (this.values.has(val)) {
			return this.values.get(val);
		}

		throw Error(`Введены неправильные параметры.\nДоступные параметры: ${this.getHelp()}`);
	}

	public getHelp(): string {
		return [...this.values.values()]
			.sort((a, b) => a.localeCompare(b))
			.map(v => `\`${v}\``)
			.join(', ');
	}
}
