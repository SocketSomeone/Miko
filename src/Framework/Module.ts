import { BaseClient } from '../Client';
import { BaseCache } from './Cache';
import { BaseCommand } from './Commands/Command';
import { BaseService } from './Services/Service';

export abstract class BaseModule {
	public client: BaseClient;
	public abstract names: {
		[key in 'ru' | 'en']?: string;
	};

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async init() {
		// NO-OP
	}

	protected registerService<T extends BaseService>(service: new (module: BaseModule) => T) {
		return this.client.registerService(this, service);
	}

	protected registerCache<P extends any, T extends BaseCache<P>>(cache: new (module: BaseModule) => T) {
		return this.client.registerCache(this, cache);
	}

	protected registerCommand<T extends BaseCommand>(command: new (module: BaseModule) => T) {
		return this.client.registerCommand(this, command);
	}
}
