import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { BaseShopRole } from '../../../Entity/ShopRole';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { NumberResolver } from '../../../Framework/Resolvers';

const ROLE_PER_PAGE = 8;

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'shop',
			aliases: ['магазин', 'шоп', 'магаз', 'items'],
			args: [
				{
					name: 'page',
					resolver: NumberResolver,
					required: false
				}
			],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [offset]: [number], { funcs: { t, e }, guild, settings }: Context) {
		const items = await BaseShopRole.find({
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

		if (items.length < 1) {
			throw new ExecuteError(t('economy.shop.empty'));
		}

		const maxPage = Math.ceil(items.length / ROLE_PER_PAGE);
		const startPage = Math.max(Math.min(offset ? offset - 1 : 0, maxPage - 1), 0);

		await this.showPaginated(t, message, startPage, maxPage, (page) => {
			const roles = items.slice(page * ROLE_PER_PAGE, (page + 1) * ROLE_PER_PAGE);
			const fields: { name: string; value: string; inline: boolean }[] = [];

			roles.map((role, i) => {
				fields.push(
					{
						name: t('economy.shop.fields.index'),
						value: `${i + 1}.`,
						inline: true
					},
					{
						name: t('economy.shop.fields.role'),
						value: `<@&${role.id}>`,
						inline: true
					},
					{
						name: t('economy.shop.fields.cost'),
						value: `${role.cost} ${e(settings.emojis.wallet)}`,
						inline: true
					}
				);
			});

			return this.createEmbed(
				{
					title: t('economy.shop.title', {
						guild: guild.name
					}),
					fields,
					footer: {
						text: null
					}
				},
				false
			);
		});
	}
}
