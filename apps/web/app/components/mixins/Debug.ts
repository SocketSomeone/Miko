/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
import { Vue, Component } from 'nuxt-property-decorator';

declare module 'vue/types/vue' {
	interface Vue {
		debug(message: unknown): void;
		error(message: unknown): void;
		success(message: unknown): void;
	}
}

const genericStyle = 'font-weight: 800; padding: 2px 5px; color: white;';
const prefix = 'Miko';

@Component
export default class extends Vue {
	debug(message: unknown): void {
		return console.log(
			`%c${prefix}%cINFO%c ${message}`,
			`${genericStyle}border-radius: 25px 0 0 25px; background: #596cae;`,
			`${genericStyle}border-radius: 0 25px 25px 0; background: #5050ff;`,
			'color: unset;'
		);
	}

	error(message: unknown): void {
		return console.log(
			`%c${prefix}%cERROR%c ${message}`,
			`${genericStyle}border-radius: 25px 0 0 25px; background: #596cae;`,
			`${genericStyle}border-radius: 0 25px 25px 0; background: #ff5050;`,
			'color: unset;'
		);
	}

	success(message: unknown): void {
		return console.log(
			`%c${prefix}%cSUCCESS%c ${message}`,
			`${genericStyle}border-radius: 25px 0 0 25px; background: #596cae;`,
			`${genericStyle}border-radius: 0 25px 25px 0; background: #50ff50; color: black;`,
			'color: unset;'
		);
	}
}
