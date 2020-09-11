import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, EmbedOptions } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BaseMessage } from '../../../Entity/Message';
import { StringResolver } from '../../../Framework/Resolvers';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'say',
			aliases: ['embed', 'ph', 'placeholder'],
			group: CommandGroup.CONFIGURE,
			args: [
				{
					name: 'placeholder',
					resolver: StringResolver,
					required: true,
					full: true
				}
			],
			guildOnly: true,
			botPermissions: [GuildPermission.MANAGE_MESSAGES],
			userPermissions: [GuildPermission.MANAGE_MESSAGES],
			premiumOnly: false,
			examples: ['Miko - your way to high quality!', '`{ "description": "You are the best!" }`']
		});
	}

	public async execute(
		message: Message,
		[placeholder]: [string],
		{ funcs: { t }, guild, settings: { prefix } }: Context
	) {
		const embed = this.client.messages.fillTemplate(placeholder);
		const nm = await this.client.messages.sendEmbed(message.channel, embed);

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
