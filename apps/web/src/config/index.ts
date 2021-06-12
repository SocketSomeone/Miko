import { join } from 'path';

const rootDir = join(__dirname, '../..');

export default {
	srcDir: join(rootDir, './app'),

	rootDir,

	components: ['~/components'],

	telemetry: false,

	dev: process.env.NODE_ENV !== 'production',

	css: ['~/assets/scss/root'],

	loading: '~/components/Loader.vue',

	router: {
		middleware: ['auth']
	}
};
