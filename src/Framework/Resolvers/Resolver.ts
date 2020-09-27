import { BaseClient } from '../../Client';
import { Context } from '../Commands/Command';
import { BaseModule } from '../Module';

export interface ResolverConstructor {
	new (module: BaseModule): Resolver;
}

export abstract class Resolver {
	protected client: BaseClient;
	protected module: BaseModule;

	public constructor(module: BaseModule) {
		this.module = module;
		this.client = module.client;
	}

	public abstract async resolve(value: any, context: Context, previous: any[]): Promise<any>;

	public getType() {
		return this.constructor.name.replace(/Resolver/g, '').toLowerCase();
	}
}
