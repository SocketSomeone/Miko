export default {
	titleTemplate: 'Miko | %s',
	link: [
		{
			rel: 'icon',
			type: 'image/x-icon',
			href: '/favicon.ico'
		},
		{
			rel: 'stylesheet',
			type: 'text/css',
			href: 'https://cdn.jsdelivr.net/npm/inter-ui@3.11.0/inter.min.css'
		}
	],
	meta: [
		{ charset: 'utf-8' },
		{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
		{
			hid: 'theme-color',
			name: 'theme-color',
			content: '#2ca0f6'
		},
		{
			hid: 'description',
			property: 'description',
			content:
				'Miko is simple, configurable bot which has many useful features that you can control on your Discord server with website. '
		},
		{
			hid: 'keywords',
			property: 'keywords',
			content: 'Need to add'
		},
		/* Open-Graph */
		{
			hid: 'og:site_name',
			property: 'og:site_name',
			content: 'Miko'
		},
		{
			hid: 'og:title',
			property: 'og:title',
			content: 'Miko'
		},
		{
			hid: 'og:description',
			property: 'og:description',
			content:
				'Miko is simple, configurable bot which has many useful features that you can control on your Discord server with website.'
		},
		{
			hid: 'og:image',
			property: 'og:image',
			content: 'https://mikoapp.xyz/assets/images/logo.png'
		}
	]
};
