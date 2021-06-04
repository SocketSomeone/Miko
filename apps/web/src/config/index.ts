import type { Context } from '@nuxt/types';
import { config } from '@miko/config';
import { join } from 'path';

const rootDir = join(__dirname, '../..');

export default {
	srcDir: join(rootDir, './app'),

	rootDir,

	components: ['~/components'],

	telemetry: false,

	dev: config.isDev,

	css: ['~/assets/scss/root'],

	loading: '~/components/Loader.vue',

	router: {
		middleware: ['auth']
	}
};
