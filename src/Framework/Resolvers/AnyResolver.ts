import { Resolver, ResolverConstructor } from './Resolver';
import { Context } from '../Commands/Command';
import { BaseModule } from '../Module';

export class AnyResolver extends Resolver {
	private resolvers: Resolver[] = [];
	private temporary: Resolver[] | ResolverConstructor[] = [];

	public constructor(module: BaseModule, ...resolvers: Resolver[] | ResolverConstructor[]) {
		super(module);

		this.temporary = resolvers;
	}

	public init() {
		this.temporary.forEach((r: Resolver | ResolverConstructor) => {
			if (r instanceof Resolver) {
				this.resolvers.push(r);
			} else {
				this.resolvers.push(new r(this.module));
			}
		});
	}

	public async resolve(value: string, context: Context, previous: any[]) {
		let lastError: Error;

		for (const resolver of this.resolvers) {
			try {
				const answer = await resolver.resolve(value, context, previous);

				return answer;
			} catch (err) {
				lastError = err;
				continue;
			}
		}

		throw lastError;
	}
}
