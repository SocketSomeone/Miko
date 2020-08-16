import { BaseClient } from '../../../../Client';
import { Context, Command } from '../../../../Framework/Commands/Command';
import { Message, EmbedOptions } from 'eris';
import { EmbedResolver } from '../../../../Framework/Resolvers';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { BaseMessage } from '../../../../Entity/Message';

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
			botPermissions: [GuildPermission.MANAGE_MESSAGES],
			userPermissions: [GuildPermission.MANAGE_MESSAGES],
			premiumOnly: false
		});
	}

	public async execute(message: Message, [m]: [EmbedOptions], { funcs: { t }, guild, settings: { prefix } }: Context) {
		let nm: Message;

		if (typeof m === 'string') {
			nm = await message.channel.createMessage(m);
		} else {
			try {
				const embed = this.createEmbed(m, false);

				nm = await message.channel.createMessage({
					embed
				});
			} catch (error) {
				throw new ExecuteError(
					t('manage.embed.error', {
						error: error.message
							.split(/[\r?\n]/)
							.slice(1, 2)
							.join('\n')
					})
				);
			}
		}

		await BaseMessage.save(
			BaseMessage.create({
				guildId: guild.id,
				channelId: nm.channel.id,
				id: nm.id,
				content: nm.content,
				embeds: nm.embeds
			})
		);

		await message.delete().catch(() => undefined);
	}
}
