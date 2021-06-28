import type { Awaited } from '@miko/common';
import type { CommandContext } from '../../helpers';

export abstract class BaseTypeReader<T> {
	public abstract read(context: CommandContext, input: string): Awaited<T>;
}
