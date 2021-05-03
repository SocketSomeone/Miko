import type { Guild } from 'discord.js';
import { Logger } from 'tslog';

export abstract class Resolver<V> {
	protected readonly name = this.constructor.name;

	protected readonly logger = new Logger({ name: this.name });

	public abstract resolve(value: string, guild: Guild | null): Promise<V>;
}
