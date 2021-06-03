import type { Awaited } from '@miko/common';
import type { Guild } from 'discord.js';
import { Logger } from 'tslog';

export abstract class BaseArgument<T> {
	protected readonly name = this.constructor.name;

	protected readonly logger = new Logger({ name: this.name });

	public abstract resolve(value: string, guild?: Guild): Awaited<T>;
}
