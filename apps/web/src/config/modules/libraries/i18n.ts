export const i18n = {
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
};
