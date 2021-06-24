import https from 'https';
import fs from 'fs';
import os from 'os';

import extract from 'extract-zip';
import { resolve } from 'path';
import { Translations } from '@crowdin/crowdin-api-client';
import { glob } from 'glob';
import { Logger } from '@nestjs/common';

const logger = new Logger('Localization');

const tempPath = os.tmpdir();
const zipFilePath = resolve(tempPath, './translations.zip');
const extractPath = resolve(tempPath, './translations');

const { PROJECT_ID, TOKEN } = Config.crowdin;
const API = new Translations({
	token: TOKEN
});

const downloadTranslations = async () => {
	const build = await API.listProjectBuilds(PROJECT_ID);

	const download = await API.downloadTranslations(PROJECT_ID, build.data[0].data.id);
	const stream = fs.createWriteStream(zipFilePath);

	return new Promise((res, rej) => {
		stream.on('finish', res);
		stream.on('error', rej);

		https.get(download.data.url, response => response.pipe(stream));
	});
};

const getJson = (languagePath: string, service: string) => {
	const jsons = glob.sync(`${resolve(languagePath, service)}/**/*.json`);
	const json = {};

	jsons.forEach((jsonPath: string) => Object.assign(json, JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))));

	return json;
};

const saveJson = (service: string, language: string, json: Object) => {
	fs.writeFileSync(
		resolve(__dirname, `../apps/${service}/${service === 'web' ? 'app' : 'src'}/i18n/${language}.json`),
		JSON.stringify(json, null, 4),
		{
			encoding: 'utf-8'
		}
	);
};

const composeJson = () => {
	for (const language of fs.readdirSync(extractPath)) {
		const languagePath = resolve(extractPath, language);
		const shared = getJson(languagePath, 'Shared');

		for (const service of fs.readdirSync(languagePath).filter(x => x !== 'Shared')) {
			saveJson(service.toLowerCase(), language, {
				...shared,
				...getJson(languagePath, service)
			});

			logger.log(`Saved ${language.toUpperCase()} language of service ${service}!`);
		}
	}
};

const updateLanguages = async () => {
	logger.log('Trying to download latest translation strings...');
	await downloadTranslations();

	logger.log('Translations dowloaded. Extracting...');
	await extract(zipFilePath, { dir: extractPath });

	logger.log('Extracted... Time to composing files and saving!');
	composeJson();

	logger.log(`Ok, all saved, time to flush temp!`);
	[zipFilePath, extractPath].forEach(path =>
		fs.statSync(path).isDirectory() ? fs.rmdirSync(path, { recursive: true }) : fs.unlinkSync(path)
	);

	logger.log(`Languages updated!`);
};

updateLanguages();
