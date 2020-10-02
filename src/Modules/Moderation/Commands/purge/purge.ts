import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { MemberResolver, NumberResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Color } from '../../../../Misc/Enums/Colors';
import { Images } from '../../../../Misc/Enums/Images';
import { BaseModule } from '../../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'clear',
			aliases: ['prune', 'purge', 'очистить'],
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
			premiumOnly: false,
			examples: ['100', '100 @user']
		});
	}

	public async execute(
		message: Message,
		[quantity, member]: [number, Member],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		if (quantity < 1) throw new ExecuteError(t('moderation.purge.invalidQuantity'));

		let messages = (await message.channel.getMessages(Math.min(quantity, 100), message.id)) || [];

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

		await this.replyAsync(message, embed);
	}
}
