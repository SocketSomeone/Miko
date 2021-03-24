import { Guild } from 'discord.js';
import { Logger } from 'tslog';

export abstract class Resolver<V> {
	protected readonly logger = new Logger({ name: this.constructor.name });

	public init(): void {
		this.logger.silly('Resolver is initialized!');
	}

	public abstract resolve(value: string, guild: Guild | null): Promise<V>;
}
