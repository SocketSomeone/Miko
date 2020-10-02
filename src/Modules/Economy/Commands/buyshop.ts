import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { BaseModule } from '../../../Framework/Module';
import { NumberResolver, AnyResolver, RoleResolver } from '../../../Framework/Resolvers';
import { Message, Role } from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BaseMember } from '../../../Entity/Member';
import { Images } from '../../../Misc/Enums/Images';
import { Cache } from '../../../Framework/Decorators/Cache';
import { ShopRolesCache } from '../../Configure/Cache/ShopRole';

export default class extends BaseCommand {
	@Cache() protected shop: ShopRolesCache;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'buyshop',
			aliases: ['buy', 'купить'],
			args: [
				{
					name: 'role | index',
					resolver: new AnyResolver(module, RoleResolver, NumberResolver),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			examples: ['@role', '1']
		});
	}

	public async execute(message: Message, [identify]: [number | Role], { funcs: { t, e }, guild, settings }: Context) {
		const roles = await this.shop.get(guild);

		const role = typeof identify === 'number' ? roles[identify - 1] : roles.find((r) => r.id === identify.id);

		if (roles.length < 1 || !role) {
			throw new ExecuteError(t('economy.buyshop.notFound'));
		}

		if (message.member.roles.includes(role.id)) {
			throw new ExecuteError(t('economy.buyshop.has'));
		}

		const person = await BaseMember.get(message.member);

		if (person.money < role.cost) {
			throw new ExecuteError(t('error.enough.money'));
		}

		person.money -= role.cost;
		await person.save();

		message.member.addRole(role.id).catch(() => undefined);

		await this.replyAsync(message, {
			author: { name: t('economy.buyshop.title'), icon_url: Images.SHOP },
			description: t('economy.buyshop.ok', {
				role: `<@&${role.id}>`
			}),
			footer: null,
			timestamp: null
		});
	}
}
