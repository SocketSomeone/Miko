import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BigIntResolver } from '../../../Framework/Resolvers';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'standart-money',
			aliases: [],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(module, 0n),
					required: false
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['1000']
		});
	}

	public async execute(message: Message, [money]: [bigint], { funcs: { t, e }, guild, settings }: Context) {
		if (money) {
			if (money === settings.economy.standart) throw new ExecuteError(t('error.changes.not'));

			settings.economy.standart = money;
			await settings.save();
		}

		await this.replyAsync(message, {
			color: money ? Color.MAGENTA : Color.GRAY,
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: money ? Images.SUCCESS : Images.SETTINGS
			},
			description: t(`configure.standart.${money ? 'new' : 'info'}`, {
				amount: `${settings.economy.standart} ${e(settings.economy.currency)}`
			}),
			footer: null,
			timestamp: null
		});
	}
}
