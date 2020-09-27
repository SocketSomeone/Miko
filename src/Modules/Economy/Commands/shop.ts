import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { BaseModule } from '../../../Framework/Module';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { EmbedField, Message } from 'eris';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { NumberResolver } from '../../../Framework/Resolvers';
import { Images } from '../../../Misc/Enums/Images';
import { Cache } from '../../../Framework/Decorators/Cache';
import { ShopRolesCache } from '../../Configure/Cache/ShopRole';

const ROLE_PER_PAGE = 8;

export default class extends BaseCommand {
	@Cache() protected shop: ShopRolesCache;

	public constructor(module: BaseModule) {
		super(module, {
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
		const items = await this.shop.get(guild);

		if (items.length < 1) {
			throw new ExecuteError(t('economy.shop.empty'));
		}

		const maxPage = Math.ceil(items.length / ROLE_PER_PAGE);
		const startPage = Math.max(Math.min(offset ? offset - 1 : 0, maxPage - 1), 0);

		await this.showPaginated(message, startPage, maxPage, (page) => {
			const roles = items.slice(page * ROLE_PER_PAGE, (page + 1) * ROLE_PER_PAGE);
			const fields: EmbedField[] = [];

			roles.map((role, i) => {
				fields.push(
					{
						name: t('economy.shop.fields.index'),
						value: `${i + 1 + page * ROLE_PER_PAGE}.`,
						inline: true
					},
					{
						name: t('economy.shop.fields.role'),
						value: `<@&${role.id}>`,
						inline: true
					},
					{
						name: t('economy.shop.fields.cost'),
						value: message.member.roles.includes(role.id)
							? t('economy.shop.bought')
							: `${role.cost} ${e(settings.currency)}`,
						inline: true
					}
				);
			});

			return this.createEmbed({
				author: {
					name: t('economy.shop.title', { guild: guild.name }),
					icon_url: Images.SHOP
				},
				fields,
				footer: null
			});
		});
	}
}
