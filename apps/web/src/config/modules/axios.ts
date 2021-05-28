export const axios = {
	baseURL: process.env.API_URL || 'http://localhost:8888/api',
	retry: { retries: 3 },
	credentials: true,
	proxy: false
};
