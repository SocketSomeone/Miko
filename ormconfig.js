module.exports = {
	type: 'postgres',
	host: process.env.DATABASE_HOST || 'localhost',
	port: Number(process.env.DATABASE_PORT) || 5432,
	username: process.env.DATABASE_USERNAME || 'postgres',
	password: process.env.DATABASE_PASSWORD || null,
	database: process.env.DATABASE || 'miko-dev',
	synchronize: process.env.NODE_ENV !== 'production',
	logging: true,
	entities: [`${__dirname}/packages/**/lib/database/entities/*.entity.js`],
	migrations: [`${__dirname}/packages/**/lib/migrations`],
	cli: {
		entitiesDir: 'src/database/entities',
		migrationsDir: 'src/migration'
	}
};
