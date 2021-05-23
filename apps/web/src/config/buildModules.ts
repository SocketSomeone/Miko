export default [
	'@nuxtjs/pwa',
	'@nuxt/typescript-build',
	[
		'@nuxtjs/vuetify',
		{
			customVariables: ['~/assets/scss/variables.scss'],
			treeShake: true,
			icons: {
				iconfont: 'mdi'
			},
			rtl: false,
			theme: {
				disable: false,
				default: 'dark',
				dark: true,
				options: {
					variations: true,
					customProperties: true
				},
				themes: {
					dark: {
						primary: '#2ca0f6',
						secondary: '#66ADEF',
						accent: '#2ca0f6',
						error: '#EB4948',
						info: '#66ADEF',
						success: '#43B480',
						warning: '#FAA61B',
						background: '#313949',
						body: {
							base: '#37445e',
							darken1: '#333E55'
						}
					}
				}
			}
		}
	],
	['@nuxtjs/google-analytics', { id: 'UA-178774480-1' }],
	[
		'@nuxtjs/moment',
		{
			timezone: true
		}
	]
];
