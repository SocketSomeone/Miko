import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { MemberResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'bal',
			aliases: ['$', 'balance'],
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: false
				}
			],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [user]: [Member], { funcs: { t, e }, guild, settings }: Context) {
		const target = user || message.member;
		const person = await BaseMember.get(target);

		await this.sendAsync(message.channel, t, {
			title: t('economy.bal.title', {
				member: `${target.user.username}#${target.user.discriminator}`
			}),
			description: t('economy.bal.desc', {
				member: target.user.mention,
				amount: `${person.money} ${e(settings.currency)}`
			})
		});
	}
}
