import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { BigIntResolver, MemberResolver } from '../../../Framework/Resolvers';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'award',
			aliases: ['выдать'],
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: true
				},
				{
					name: 'money',
					resolver: new BigIntResolver(module, 1n),
					required: true
				}
			],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['@user 1000']
		});
	}

	public async execute(
		message: Message,
		[user, money]: [Member, bigint],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		const target = await BaseMember.get(user);

		target.money += money;
		await target.save();

		await this.sendAsync(message.channel, {
			author: { name: t('economy.award.title'), icon_url: Images.ECONOMY },
			description: t('economy.award.desc', {
				member: message.member,
				target: user,
				amount: `${money} ${e(settings.currency)}`
			}),
			timestamp: null,
			footer: null
		});
	}
}
