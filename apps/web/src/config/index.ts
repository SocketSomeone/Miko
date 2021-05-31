export default {
	srcDir: './app',

	rootDir: '.',

	components: ['~/components'],

	telemetry: false,

	dev: process.env.NODE_ENV !== 'production',

	target: 'server',

	css: ['~/assets/scss/root'],

	loading: '~/components/Loader.vue',

	router: {
		middleware: ['auth']
	}
};
