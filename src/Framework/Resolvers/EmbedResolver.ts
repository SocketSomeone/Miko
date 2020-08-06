import { Role, EmbedOptions } from 'eris';
import { Context } from '../commands/Command';
import { Resolver } from './Resolver';

export class EmbedResolver extends Resolver {
	public async resolve(value: string, { guild, funcs: { t } }: Context): Promise<EmbedOptions | string> {
		try {
			let embed = JSON.parse(value);

			if (typeof embed.thumbnail === 'string') {
				embed.thumbnail = {
					url: embed.thumbnail || null
				};
			}

			if (typeof embed.image === 'string') {
				embed.image = {
					url: embed.image || null
				};
			}

			embed.footer = embed.footer || {
				text: null
			};

			return embed;
		} catch (err) {
			return value;
		}
	}
}
