import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { BaseModule } from '../../../Framework/Module';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { EmbedField, Message } from 'eris';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BaseMember } from '../../../Entity/Member';

const USERS_PER_PAGE = 8;

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'top',
			aliases: ['лидеры', 'топ'],
			args: [],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		const data = await BaseMember.find({
			where: {
				guild: {
					id: guild.id
				}
			},
			order: {
				money: 'DESC'
			},
			take: 64
		});

		if (data.length < 1) {
			throw new ExecuteError(t('economy.top.error'));
		}

		const maxPage = Math.ceil(data.length / USERS_PER_PAGE);
		const startPage = 0;

		await this.showPaginated(message, startPage, maxPage, (page) => {
			const members = data.slice(page * USERS_PER_PAGE, (page + 1) * USERS_PER_PAGE);
			const fields: EmbedField[] = [];

			members.map((m, i) => {
				fields.push(
					{
						name: t('economy.top.fields.index'),
						value: `${i + 1 + page * USERS_PER_PAGE}.`,
						inline: true
					},
					{
						name: t('economy.top.fields.role'),
						value: `<@${m.user}>`,
						inline: true
					},
					{
						name: t('economy.top.fields.cost'),
						value: `${m.money} ${e(settings.currency)}`,
						inline: true
					}
				);
			});

			return this.createEmbed({
				author: {
					name: t('economy.top.title'),
					icon_url: guild.iconURL
				},
				fields
			});
		});
	}
}
