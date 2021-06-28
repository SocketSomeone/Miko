import type { Context, NuxtConfig } from '@nuxt/types';

export default {
	cache: true,
	ssr: true,
	friendlyErrors: true,
	hotMiddleware: {
		client: {
			overlay: false
		}
	},
	extend(config: any, { isClient }: Context) {
		config.devtool = isClient ? 'eval-source-map' : 'inline-source-map';
	}
};
