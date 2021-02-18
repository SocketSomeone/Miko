type ColorTextFn = (text: string) => string;

export const clc: {[key: string]: ColorTextFn} = {
	green: (text: string) => `\x1B[32m${text}\x1B[39m`,
	yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
	red: (text: string) => `\x1B[31m${text}\x1B[39m`,
	cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
	magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`
};
