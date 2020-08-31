const { prod, maxShard, instance } = require('./config.json');

const config = {
	script: 'bin/Root.js',
	cron_restart: '1 0 * * *',
	watch: ['node_modules', 'bin'],
	log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS'
};

const apps = [];

for (let j = 1; j <= maxShard; j++) {
	apps.push({
		name: `${instance} | Shard ${j}`,
		args: `production ${prod.TOKEN} ${j} ${maxShard} --no-rabbitmq`,
		...config
	});
}

module.exports = {
	apps
};
