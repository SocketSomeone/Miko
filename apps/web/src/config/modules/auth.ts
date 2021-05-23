export const auth = {
	redirect: {
		callback: '/callback',
		logout: '/',
		login: '/',
		home: '/'
	},
	cookie: undefined,
	strategies: {
		discord: {
			scheme: 'oauth2',
			clientId: '718758028639207524',
			clientSecret: 'WfKfw-8lt4NDiw_rUyixMB8sSOl6oViM',
			endpoints: {
				authorization: 'https://discord.com/api/oauth2/authorize',
				token: 'https://discord.com/api/oauth2/token',
				userInfo: 'https://discord.com/api/users/@me'
			},
			scope: ['identify', 'email']
		}
	}
};
