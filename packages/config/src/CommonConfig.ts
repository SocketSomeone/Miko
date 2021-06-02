export const common = {
	instanceName: process.env.CLUSTER_NAME || 'NOT_SET',
	env: process.env.NODE_ENV || 'development',
	isDev: process.env.NODE_ENV !== 'production',
	SENTRY_DSN: 'https://0fa69e5b9d7a4b45bfddd8681d80a4ee@o423458.ingest.sentry.io/5353727',
	RABBIT_MQ: 'amqps://jjzphote:EcNzpcimSlAPj7od_l45XEkI-A20UkH9@cow.rmq2.cloudamqp.com/jjzphote'
};
