import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { StringResolver, ChannelResolver, RoleResolver, BigIntResolver } from '../../../../Framework/Resolvers';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member, Channel, Role } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Enums/GuildPermissions';
import { BaseShopRole } from '../../../../Entity/ShopRole';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
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
			group: CommandGroup.MANAGEMENT,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_GUILD, GuildPermission.MANAGE_ROLES]
		});
	}

	public async execute(message: Message, [role, price]: [Role, bigint], { funcs: { t, e }, guild, settings }: Context) {
		const changeRole = await BaseShopRole.findOne({
			where: {
				guild: {
					id: guild.id
				},
				id: role.id
			}
		});

		const embed = this.createEmbed(
			{
				title: t('configure.title'),
				footer: {
					text: null
				}
			},
			false
		);

		if (changeRole) {
			changeRole.cost = price;
			await changeRole.save();

			embed.description = t('configure.addshop.change', {
				role: role.mention
			});
			return;
		} else {
			await BaseShopRole.save(
				BaseShopRole.create({
					id: role.id,
					cost: price,
					guild: {
						id: guild.id
					}
				})
			);

			embed.description = t('configure.addshop.new', {
				role: role.mention
			});
		}

		await this.replyAsync(message, t, embed);
	}
}
