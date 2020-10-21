import { ShardCommand, ShardCommandType } from './ShardCommand';

export default class extends ShardCommand {
	public cmd: ShardCommandType;

	public async execute() {
		let channelCount = this.client.groupChannels.size + this.client.privateChannels.size;
		let roleCount = 0;

		this.client.guilds.forEach((g) => {
			channelCount += g.channels.size;
			roleCount += g.roles.size;
		});

		const data: any = {
			id: 'status',
			cmd: ShardCommandType.STATUS,
			state: !this.client.hasStarted ? 'init' : 'running',
			startedAt: this.client.startedAt.format('HH:mm:ss DD.MM.YYYY'),
			gateway: [...this.client.shardsConnected],
			metrics: {
				...this.client.stats
			},
			service: {},
			cache: {
				guilds: this.client.guilds.size,
				users: this.client.users.size,
				channels: channelCount,
				roles: roleCount
			}
		};

		for (const [clazz, service] of this.client.services) {
			data.service[clazz.name.toLowerCase().replace('service', '')] = service.getStatus();
		}

		for (const [clazz, cache] of this.client.caches) {
			data.cache[clazz.name.toLowerCase().replace('cache', '')] = cache.size;
		}

		await this.sendToManager(data);
	}
}
