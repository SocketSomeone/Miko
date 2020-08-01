import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, BigNumberResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import BigNumber from 'bignumber.js';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'standart-money',
			aliases: [],
			args: [
				{
					name: 'money',
					resolver: new BigNumberResolver(client, 0),
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [money]: [BigNumber], { funcs: { t, e }, guild, settings }: Context) {
		if (money) {
			settings.prices.standart = money;
			await this.client.cache.guilds.updateOne(guild);
		}

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(`configure.standart.${money ? 'new' : 'info'}`, {
				amount: `${settings.prices.standart.toFormat()} ${e(settings.emojis.wallet)}`
			}),
			footer: {
				text: ''
			}
		});
	}
}
