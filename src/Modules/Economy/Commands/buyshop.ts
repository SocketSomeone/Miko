import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { NumberResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import { BaseShopRole } from '../../../Entity/ShopRole';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BaseMember } from '../../../Entity/Member';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'buyshop',
			aliases: ['buy', 'купить'],
			args: [
				{
					name: 'index',
					resolver: NumberResolver,
					required: true
				}
			],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES]
		});
	}

	public async execute(message: Message, [index]: [number], { funcs: { t, e }, guild, settings }: Context) {
		const roles = await BaseShopRole.find({
			where: {
				guild: {
					id: guild.id
				}
			},
			order: {
				cost: 'ASC',
				createdAt: 'ASC'
			}
		});

		const role = roles[index - 1];

		if (roles.length < 1 || !role) {
			throw new ExecuteError(t('economy.buyshop.notFound'));
		}

		if (message.member.roles.includes(role.id)) {
			throw new ExecuteError(t('economy.buyshop.has'));
		}

		const person = await BaseMember.get(message.member);

		if (person.money < role.cost) {
			throw new ExecuteError(
				t('error.enough.money', {
					emoji: e(settings.emojis.wallet)
				})
			);
		}

		person.money -= role.cost;
		await person.save();

		message.member.addRole(role.id).catch(() => undefined);

		await this.replyAsync(message, t, {
			title: t('economy.buyshop.title'),
			description: t('economy.buyshop.ok', {
				role: `<@&${role.id}>`
			}),
			footer: {
				text: null
			}
		});
	}
}
