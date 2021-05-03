import type { NuxtConfig } from '@nuxt/types';

export default <NuxtConfig>{
	srcDir: './app',

	rootDir: '.',

	components: true,

	css: ['~/assets/scss/root.scss'],

	loading: '~/components/Loader.vue',

	router: {
		middleware: ['auth']
	}
};
