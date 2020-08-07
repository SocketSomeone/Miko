import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BigIntResolver, MemberResolver } from '../../../Framework/Resolvers';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'give',
			aliases: ['pay', 'передать'],
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: true
				},
				{
					name: 'money',
					resolver: new BigIntResolver(client, 0n),
					required: true
				}
			],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(
		message: Message,
		[user, money]: [Member, bigint],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		if (user.id === message.author.id) throw new ExecuteError(t('error.similar.member'));

		const target = await BaseMember.get(user);
		const person = await BaseMember.get(message.member);

		if (person.money < money)
			throw new ExecuteError({
				description: t('error.enough.money', {
					emoji: e(settings.emojis.wallet),
					amount: money - person.money
				})
			});

		target.money += money;
		person.money -= money;

		await person.save();
		await target.save();

		await this.sendAsync(message.channel, t, {
			title: t('economy.give.title'),
			description: t('economy.give.desc', {
				member: message.member.mention,
				target: user.mention,
				amount: `${money} ${e(settings.emojis.wallet)}`
			})
		});
	}
}
