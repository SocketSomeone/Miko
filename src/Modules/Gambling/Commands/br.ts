import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { chance } from '../../../Misc/Utils/Chance';
import { BigIntResolver } from '../../../Framework/Resolvers';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'br',
			aliases: [],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(module, 1n),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			examples: ['1000']
		});
	}

	public async execute(
		message: Message,
		[money]: [bigint],
		{ funcs: { t, e }, guild, settings: { currency } }: Context
	) {
		const person = await BaseMember.get(message.member);

		if (person.money < money) throw new ExecuteError(t('error.enough.money'));

		person.money -= money;

		const int = chance.integer({ min: 0, max: 100 });

		const embed = this.createEmbed({
			title: t('gambling.br.title'),
			color: int < 80 ? Color.RED : Color.GREEN,
			thumbnail: {
				url: 'https://i.imgur.com/p210WxA.png'
			},
			footer: null
		});

		if (int.range([80, 95])) {
			person.money += money * 2n;

			embed.description = t('gambling.br.win', {
				int,
				bet: money * 2n - money,
				emoji: e(currency)
			});
		} else if (int.range([95, 101])) {
			person.money += money * 3n;

			embed.description = t('gambling.br.win', {
				int,
				bet: money * 3n - money,
				emoji: e(currency)
			});
		} else {
			embed.description = t('gambling.br.lose', {
				int
			});
		}

		await person.save();
		await this.replyAsync(message, embed);
	}
}
