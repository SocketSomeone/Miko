import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { MemberResolver, NumberResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Color } from '../../../../Misc/Enums/Colors';
import { Images } from '../../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'clear',
			aliases: ['prune', 'purge', 'очистить'],
			group: CommandGroup.MODERATION,
			args: [
				{
					name: 'count',
					resolver: NumberResolver,
					required: true
				},
				{
					name: 'user',
					resolver: MemberResolver
				}
			],
			guildOnly: true,
			botPermissions: [GuildPermission.READ_MESSAGE_HISTORY, GuildPermission.MANAGE_MESSAGES],
			userPermissions: [GuildPermission.READ_MESSAGE_HISTORY, GuildPermission.MANAGE_MESSAGES],
			premiumOnly: false
		});
	}

	public async execute(
		message: Message,
		[quantity, member]: [number, Member],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		if (quantity < 1) throw new ExecuteError(t('moderation.purge.invalidQuantity'));

		let messages = await message.channel.getMessages(Math.min(quantity, 100), message.id);

		if (member) messages.filter((a) => a.author && a.author.id === member.id);

		messages.push(message);

		const embed = this.createEmbed({
			color: Color.MAGENTA,
			author: { name: t('moderation.purge.title'), icon_url: Images.SUCCESS },
			description: t('moderation.purge.text', {
				member: message.member,
				amount: messages.length
			}),
			footer: null,
			timestamp: null
		});

		try {
			await this.client.deleteMessages(
				message.channel.id,
				messages.map((m) => m.id),
				'purge command'
			);
		} catch (err) {
			throw new ExecuteError(t('moderation.purge.error'));
		}

		await this.replyAsync(message, t, embed);
	}
}
