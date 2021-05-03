export const axios = {
	baseURL: process.env.BASE_URL || 'http://localhost:3000/api',
	retry: { retries: 3 },
	credentials: false,
	proxy: true
};
