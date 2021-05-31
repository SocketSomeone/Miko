/* eslint-disable @typescript-eslint/no-var-requires */
import nuxtConfig from './nuxt.config';

const { Nuxt, Builder } = require('nuxt');

const nuxt = new Nuxt(nuxtConfig);

const builder = new Builder(nuxt);

async function run() {
	await nuxt.ready();

	if (nuxtConfig.dev) {
		try {
			await builder.build();
		} catch (err) {
			console.error(err);

			process.exit(1);
		}
	}

	await nuxt.listen(3000);

	if (!nuxtConfig.dev) {
		console.info('Web Server listening on 3000');
	}
}

run().catch(err => {
	console.error(err);

	process.exit(1);
});
