import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import BigNumber from 'bignumber.js';
import { BigIntResolver } from '../../../Framework/Resolvers';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'standart-money',
			aliases: [],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(client, 0n),
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [money]: [bigint], { funcs: { t, e }, guild, settings }: Context) {
		if (money) {
			settings.prices.standart = String(money);
			await settings.save();
		}

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(`configure.standart.${money ? 'new' : 'info'}`, {
				amount: `${settings.prices.standart} ${e(settings.currency)}`
			}),
			footer: {
				text: ''
			}
		});
	}
}
