export const sitemap = {
	hostname: 'https://mikoapp.xyz',
	exclude: ['/guilds/**'],
	i18n: true,
	defaults: {
		changefreq: 'daily',
		priority: 1,
		lastmod: new Date()
	}
};
