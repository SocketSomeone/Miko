import { Command, Context } from '../../../Framework/Services/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BigIntResolver, MemberResolver } from '../../../Framework/Resolvers';
import { Images } from '../../../Misc/Enums/Images';

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
			premiumOnly: false,
			examples: ['@user 1000']
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

		if (person.money < money) throw new ExecuteError(t('error.enough.money'));

		target.money += money;
		person.money -= money;

		await person.save();
		await target.save();

		await this.sendAsync(message.channel, {
			author: { name: t('economy.give.title'), icon_url: Images.ECONOMY },
			description: t('economy.give.desc', {
				member: message.member,
				target: user,
				amount: `${money} ${e(settings.currency)}`
			}),
			footer: null,
			timestamp: null
		});
	}
}
