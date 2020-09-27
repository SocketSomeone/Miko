const { BaseClient } = require('../bin/Client');
const { writeFileSync } = require('fs');
const i18n = require('i18n');

const client = new BaseClient({
	token: null,
	shardCount: 1,
	shardId: 1,
	config: {},
	flags: ['--no-rabbitmq']
});

(async () => {
	await client.init();

	const { CommandGroup } = require('../bin/Misc/Models/CommandGroup');

	const commands = [...client.commands.values()]
		.map((c) => {
			if (c.group === null) return null;

			const field = c.args.filter((x) => x.required).length < 1 ? '' : null;

			return {
				name: c.name,
				aliases: c.aliases,
				description: i18n.__({ locale: 'ru', phrase: `info.help.cmdDesc.${c.name.toLowerCase()}` }),
				examples: c.examples.concat([field]).filter((x) => x !== null),
				module: CommandGroup[c.group]
			};
		})
		.filter((x) => !!x);

	writeFileSync('./scripts/tmp/commands.json', JSON.stringify(commands), 'utf8');

	process.exit();
})();
