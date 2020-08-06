import { BaseClient } from '../../../../Client';
import { Context, Command } from '../../../../Framework/Commands/Command';
import { Message, Member, EmbedOptions } from 'eris';
import { EmbedResolver } from '../../../../Framework/Resolvers';
import { BaseMember } from '../../../../Entity/Member';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { Color } from '../../../../Misc/Enums/Colors';

import moment from 'moment';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'embed',
			aliases: ['say', 'ph', 'placeholder'],
			group: CommandGroup.MANAGEMENT,
			args: [
				{
					name: 'message',
					resolver: EmbedResolver,
					required: true,
					full: true
				}
			],
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [m]: [EmbedOptions], { funcs: { t }, guild, settings: { prefix } }: Context) {
		if (typeof m === 'string') {
			await message.channel.createMessage(m);
		} else {
			try {
				const embed = this.createEmbed(m, false);

				await message.channel.createMessage({
					embed
				});
			} catch (error) {
				throw new ExecuteError(
					t('manage.embed.error', {
						error: error.message.split(/[\r?\n]/).slice(0, 1)
					})
				);
			}
		}

		await message.delete().catch(() => undefined);

		return;
	}
}
