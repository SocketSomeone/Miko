import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { RoleResolver, BigIntResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Role } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BaseShopRole } from '../../../Entity/ShopRole';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';
import { Cache } from '../../../Framework/Decorators/Cache';
import { ShopRolesCache } from '../Cache/ShopRole';

export default class extends BaseCommand {
	@Cache() shop: ShopRolesCache;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'addshop',
			aliases: [],
			args: [
				{
					name: 'role',
					resolver: RoleResolver,
					required: true
				},
				{
					name: 'price',
					resolver: BigIntResolver,
					required: true
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_GUILD, GuildPermission.MANAGE_ROLES],
			examples: ['@role 100', '741329695185960960 100']
		});
	}

	public async execute(
		message: Message,
		[role, price]: [Role, bigint],
		{ funcs: { t, e }, guild, settings: { currency } }: Context
	) {
		const roles = await this.shop.get(guild);
		const changeRole = roles.find((x) => x.id === role.id);

		const embed = this.createEmbed({
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: Images.SUCCESS
			},
			color: Color.MAGENTA,
			description: t(`configure.addshop.${changeRole ? 'change' : 'new'}`, {
				role: role.mention,
				price: `${price} ${e(currency)}`
			}),
			footer: null,
			timestamp: null
		});

		if (changeRole) {
			changeRole.cost = price;
			await changeRole.save();
		} else {
			await BaseShopRole.create({
				id: role.id,
				cost: price,
				guild: {
					id: guild.id
				}
			}).save();
		}

		this.shop.flush(guild.id);

		await this.replyAsync(message, embed);
	}
}
