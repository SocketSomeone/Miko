import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';

import moment from 'moment';
import { Color } from '../../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { MemberResolver, StringResolver, NumberResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';
import { UserResolver } from '../../../../Framework/Resolvers/UserResolver';

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
		const embed = this.createEmbed({
			title: t('moderation.purge.title')
		});

		if (quantity < 1)
			throw new ExecuteError({
				description: t('moderation.purge.invalidQuantity')
			});

		let messages = await message.channel.getMessages(Math.min(quantity, 100), message.id);

		if (member) messages.filter((a) => a.author && a.author.id === member.id);

		messages.push(message);

		try {
			await this.client.deleteMessages(
				message.channel.id,
				messages.map((m) => m.id),
				'purge command'
			);

			embed.description = t('moderation.purge.text', {
				member: message.member.mention,
				amount: messages.length
			});
		} catch (err) {
			embed.title = t('moderation.purge.error');
			embed.description = err.message;
		}

		await this.replyAsync(message, t, embed);
	}
}
