import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BigIntResolver } from '../../../Framework/Resolvers';
import { Images } from '../../../Misc/Enums/Images';

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
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['1000']
		});
	}

	public async execute(message: Message, [money]: [bigint], { funcs: { t, e }, guild, settings }: Context) {
		if (money) {
			settings.prices.standart = String(money);
			await settings.save();
		}

		await this.replyAsync(message, t, {
			color: money ? Color.MAGENTA : Color.GRAY,
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: money ? Images.SUCCESS : Images.SETTINGS
			},
			description: t(`configure.standart.${money ? 'new' : 'info'}`, {
				amount: `${settings.prices.standart} ${e(settings.currency)}`
			}),
			footer: null,
			timestamp: null
		});
	}
}
