import os from 'os';

export const common = {
	instanceName: os.hostname(),
	env: process.env.NODE_ENV,
	isDev: process.env.NODE_ENV !== 'production',
	SENTRY_DSN: 'https://0fa69e5b9d7a4b45bfddd8681d80a4ee@o423458.ingest.sentry.io/5353727',
	RABBIT_MQ: 'amqp://localhost'
};
