const { readFileSync, readdirSync, statSync } = require('fs');
const { resolve, relative } = require('path');
const chalk = require('chalk');

const ru = require('../i18n/ru.json');

const REGEX = /(?:\W(?:t)\(|phrase:)\s*['`"](.+?)['`"]/gi;

const found = [];
const variablePrefixes = [];

let hasError = false;

function readDir(dir) {
	const fileNames = readdirSync(dir);
	for (const fileName of fileNames) {
		const file = dir + '/' + fileName;

		if (statSync(file).isDirectory()) {
			readDir(file);
			continue;
		}

		if (!file.endsWith('.ts') && !file.endsWith('.tsx')) {
			continue;
		}

		const text = readFileSync(file, 'utf8');
		const fileFound = [];

		let matches;
		while ((matches = REGEX.exec(text))) {
			fileFound.push(matches[1]);
		}

		found.push([relative(resolve(__dirname, '../'), file), fileFound]);
	}
}

function flattenLang(lang, prefix) {
	let arr = [];
	for (const key of Object.keys(lang)) {
		const value = lang[key];
		const subKey = `${prefix ? prefix + '.' : ''}${key}`;

		if (typeof value === 'string') {
			arr.push(subKey);
		} else {
			arr = arr.concat(flattenLang(value, subKey));
		}
	}
	return arr;
}

function checkLang(lang, key) {
	const parts = key.split('.');
	let obj = lang;
	if (typeof obj === 'undefined') {
		return false;
	}

	for (let i = 0; i < parts.length; i++) {
		obj = obj[parts[i]];
		if (typeof obj === 'undefined') {
			return false;
		}
	}
	return true;
}
console.clear();
console.log(chalk.blue('\nПроверка того, что все используемые ключи переведены ...\n'));

readDir(resolve(__dirname, '../src'));

for (const [file, matches] of found) {
	for (const match of matches) {
		let variableIndex = match.indexOf('$');
		if (variableIndex >= 0) {
			variablePrefixes.push(match.substr(0, variableIndex));
			console.log(chalk.yellow(`⚠️ ${chalk.blue(file)}: Переменная найдена ${chalk.blue(match)} - пропуск проверки`));
			continue;
		}

		const ruOk = checkLang(ru, match);
		if (!ruOk) {
			console.error(chalk.red(`✗ ${chalk.blue(match)} (RU) из файла ${chalk.blue(file)}`));
			hasError = true;
		}
	}

	console.log(chalk.green(`✓ ${file}`));
}

console.log(chalk.blue('\nПроверка того, что все переведенные ключи используются...\n'));

const keys = []
	.concat(flattenLang(ru).map((key) => ['RU', key]))
	.filter(([, key], i, arr) => arr.findIndex(([, key2]) => key2 === key) === i);

for (const [lang, key] of keys) {
	if (!found.some(([, matches]) => matches.includes(key))) {
		if (variablePrefixes.some((prefix) => key.startsWith(prefix))) {
			console.log(chalk.yellow(`⚠️ ${chalk.blue(key)}: Ключ начинается с префикса переменной - пропуск проверки`));
			continue;
		}

		console.error(chalk.red(`✗ ${chalk.blue(key)} (${lang}) нигде не используется`));
	}

	console.log(chalk.green(`✓ ${key}`));
}
