import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, EmbedField } from 'eris';
import { Gifts } from '../Models/Gifts';
import { NumberResolver } from '../../../Framework/Resolvers';

const GIFTS_PER_PAGE = 6;

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'gifts',
			aliases: ['подарки'],
			args: [
				{
					name: 'page',
					resolver: NumberResolver,
					required: false
				}
			],
			group: CommandGroup.WAIFU,
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [offset]: [number], { funcs: { t, e }, guild, settings }: Context) {
		const maxPage = Math.ceil(Gifts.length / GIFTS_PER_PAGE);
		const startPage = Math.max(Math.min(offset ? offset - 1 : 0, maxPage - 1), 0);

		await this.showPaginated(t, message, startPage, maxPage, (page) => {
			return this.createEmbed({
				title: t('waifu.gifts.title'),
				fields: Gifts.sort((a, b) => a.cost - b.cost)
					.slice(page * GIFTS_PER_PAGE, (page + 1) * GIFTS_PER_PAGE)
					.map((gift) => {
						return {
							name: `${t(gift.name)} ${gift.raw}`,
							value: `${gift.cost} ${e(settings.emojis.wallet)}`,
							inline: true
						};
					})
			});
		});
	}
}
