import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BigIntResolver, MemberResolver } from '../../../Framework/Resolvers';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'take',
			aliases: ['забрать'],
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: true
				},
				{
					name: 'money',
					resolver: new BigIntResolver(client, 1n),
					required: true
				}
			],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(
		message: Message,
		[user, money]: [Member, bigint],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		const target = await BaseMember.get(user);

		target.money = target.money < money ? 0n : target.money - money;
		await target.save();

		await this.sendAsync(message.channel, t, {
			title: t('economy.take.title'),
			description: t('economy.take.desc', {
				member: message.member.mention,
				target: user.mention,
				amount: `${money} ${e(settings.currency)}`
			})
		});
	}
}
