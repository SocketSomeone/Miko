const { prod, instance } = require('./config.json');

const config = {
	script: 'bin/Root.js',
	cron_restart: '1 0 * * *',
	log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS'
};

module.exports = {
	apps: [
		{
			name: `${instance} | Range shard: 0-1`,
			args: `--no-rabbitmq ${prod.TOKEN} 0 1 2`,
			...config
		}
	]
};
