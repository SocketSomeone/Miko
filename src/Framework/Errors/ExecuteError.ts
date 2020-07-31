import { EmbedOptions, Embed } from 'eris';
import { Color } from '../../Misc/Enums/Colors';

export class ExecuteError extends Error {
	public embed: EmbedOptions;

	constructor(data: string | EmbedOptions) {
		super('Error when command executed by user!');

		this.embed = typeof data === 'string' ? { description: data } : data;
	}
}
