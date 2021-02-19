import { Logger } from 'tslog';

export abstract class MiResolver<V> {
	protected readonly logger = new Logger({ name: this.constructor.name });

	public init(): void {
		this.logger.silly('Resolver is initialized!');
	}

	public abstract resolver(value: string): Promise<V>;
}
