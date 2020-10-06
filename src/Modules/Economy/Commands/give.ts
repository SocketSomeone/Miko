import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { BaseModule } from '../../../Framework/Module';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BigIntResolver, MemberResolver } from '../../../Framework/Resolvers';
import { Images } from '../../../Misc/Enums/Images';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
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
					resolver: new BigIntResolver(module, 0n),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			examples: ['@user 1000']
		});
	}

	public async execute(
		message: Message,
		[user, money]: [Member, bigint],
		{
			funcs: { t, e },
			guild,
			settings: {
				economy: { currency }
			}
		}: Context
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
				amount: `${money} ${e(currency)}`
			}),
			footer: null,
			timestamp: null
		});
	}
}
