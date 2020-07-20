import { BaseClient } from '../../Client';
import { Context } from '../Commands/Command';

export interface ResolverConstructor {
	new (client: BaseClient): Resolver;
}

export abstract class Resolver {
	protected client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public abstract async resolve(value: any, context: Context, previous: any[]): Promise<any>;

	public getType() {
		return this.constructor.name.replace(/Resolver/g, '').toLowerCase();
	}
}
