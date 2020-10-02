import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { NumberResolver } from '../../../Framework/Resolvers';
import { Message } from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { BaseModule } from '../../../Framework/Module';
import { Cache } from '../../../Framework/Decorators/Cache';
import { ShopRolesCache } from '../Cache/ShopRole';

export default class extends BaseCommand {
	@Cache() protected shop: ShopRolesCache;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'removeshop',
			aliases: [],
			args: [
				{
					name: 'index',
					resolver: NumberResolver,
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_GUILD, GuildPermission.MANAGE_ROLES],
			examples: ['1']
		});
	}

	public async execute(message: Message, [index]: [number], { funcs: { t, e }, guild, settings }: Context) {
		const roles = await this.shop.get(guild);
		const role = roles[index - 1];

		if (roles.length < 1 || !role) throw new ExecuteError(t('configure.removeshop.notFound'));

		role.remove().catch(() => undefined);

		this.shop.flush(guild.id);

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			title: t('configure.title'),
			description: t('configure.removeshop.deleted', {
				role: `<@&${role.id}>`
			}),
			footer: null,
			timestamp: null
		});
	}
}
