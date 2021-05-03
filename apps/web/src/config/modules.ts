export default [
	'@nuxt/components',
	'@nuxtjs/axios',
	'@nuxtjs/toast',
	'@nuxtjs/auth-next',
	'@nuxtjs/sentry',
	[
		'nuxt-lazy-load',
		{
			observerConfig: {
				rootMargin: '50px 0px 50px 0px',
				threshold: 0
			}
		}
	],
	[
		'nuxt-i18n',
		{
			strategy: 'no_prefix',
			locales: [
				{
					code: 'en',
					name: 'English',
					file: 'en.json'
				},
				{
					code: 'ru',
					name: 'Русский',
					file: 'ru.json'
				}
			],
			defaultLocale: 'en',
			lazy: true,
			langDir: '~/i18n',
			vueI18n: {
				fallbackLocale: 'en'
			},
			detectBrowserLanguage: {
				useCookie: true,
				cookieKey: 'language',
				onlyOnRoot: true
			}
		}
	]
];
