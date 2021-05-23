import type { Awaited } from '@miko/types';
import type { Guild } from 'discord.js';
import { Logger } from 'tslog';

export abstract class BaseResolver<T> {
	protected readonly name = this.constructor.name;

	protected readonly logger = new Logger({ name: this.name });

	public abstract resolve(value: string, guild: Guild | null): Awaited<T>;
}
