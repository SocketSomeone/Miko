export const axios = {
	baseURL: process.env.API_URL || 'http://localhost:1337/api',
	retry: { retries: 3 },
	credentials: true,
	proxy: false
};
