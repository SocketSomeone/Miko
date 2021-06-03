export default [
	'nuxt-i18n',
	[
		'nuxt-lazy-load',
		{
			observerConfig: {
				rootMargin: '50px 0px 50px 0px',
				threshold: 0
			}
		}
	],
	'@nuxtjs/axios',
	'@nuxtjs/toast',
	'@nuxtjs/auth-next',
	'@nuxtjs/sentry',
	'@nuxtjs/sitemap',
	'@nuxtjs/robots'
];
