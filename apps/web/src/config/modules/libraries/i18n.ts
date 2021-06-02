export const i18n = {
	strategy: 'no_prefix',
	locales: [
		{
			code: 'en',
			iso: 'en-US',
			name: 'English',
			file: 'en.json'
		},
		{
			code: 'ru',
			iso: 'ru-RU',
			name: 'Русский',
			file: 'ru.json'
		}
	],
	defaultLocale: 'en',
	defaultDirection: 'ltr',
	lazy: true,
	langDir: '~/i18n',
	vueI18n: {
		fallbackLocale: 'en',
		silentTranslationWarn: true,
		silentFallbackWarn: true
	},
	detectBrowserLanguage: {
		useCookie: true,
		cookieKey: 'language',
		alwaysRedirect: false,
		fallbackLocale: 'en',
		onlyOnNoPrefix: true,
		cookieCrossOrigin: true
	}
};
