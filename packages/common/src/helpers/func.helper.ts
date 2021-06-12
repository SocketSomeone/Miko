import type { IFunctionParameter } from '../interfaces';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const ARGUMENT_NAMES = /([^,]+)/g;

export const getParamNames = (func: Function): IFunctionParameter[] => {
	const fnStr = func.toString().replace(STRIP_COMMENTS, '');
	const args = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

	if (args === null) {
		return [];
	}

	return args.map(arg => {
		const parsed = arg.trim().split(' ');

		return {
			name: parsed[0],
			optional: !!parsed[1]
		};
	});
};
