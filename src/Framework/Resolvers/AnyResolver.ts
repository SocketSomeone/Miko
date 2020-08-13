import { Resolver, ResolverConstructor } from './Resolver';
import { BaseClient } from '../../Client';
import { Context } from '../Commands/Command';

export class AnyResolver extends Resolver {
	private resolvers: Resolver[];

	public constructor(client: BaseClient, ...resolvers: Resolver[] | ResolverConstructor[]) {
		super(client);

		this.resolvers = [];

		resolvers.forEach((r: Resolver | ResolverConstructor) => {
			if (r instanceof Resolver) {
				this.resolvers.push(r);
			} else {
				this.resolvers.push(new r(this.client));
			}
		});
	}

	public async resolve(value: string, context: Context, previous: any[]) {
		let lastError;

		for (const resolver of this.resolvers) {
			try {
				const answer = await resolver.resolve(value, context, previous);

				return answer;
			} catch (err) {
				lastError = err;
				continue;
			}
		}

		throw new lastError();
	}
}
