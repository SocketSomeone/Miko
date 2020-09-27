import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BaseMessage } from '../../../Entity/Message';
import { StringResolver } from '../../../Framework/Resolvers';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
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
		const embed = this.msg.fillTemplate(placeholder);
		const nm = await this.msg.sendEmbed(message.channel, embed);

		await BaseMessage.create({
			guildId: guild.id,
			channelId: nm.channel.id,
			id: nm.id,
			content: nm.content,
			embeds: nm.embeds
		}).save();

		await message.delete().catch(() => undefined);
	}
}
