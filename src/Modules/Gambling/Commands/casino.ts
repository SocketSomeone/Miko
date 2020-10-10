import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { BigIntResolver } from '../../../Framework/Resolvers';
import { BaseModule } from '../../../Framework/Module';

const items: { mult: number; chance: number }[] = [
	{
		mult: 0,
		chance: 100
	},
	{
		mult: -1,
		chance: 20
	},
	{
		mult: 0.5,
		chance: 60
	},
	{
		mult: 2,
		chance: 60
	},
	{
		mult: 4,
		chance: 35
	},
	{
		mult: 10,
		chance: 5
	}
];

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'casino',
			aliases: ['казино'],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(module, 10n),
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
		{
			funcs: { t, e },
			settings: {
				economy: { currency }
			}
		}: Context
	) {
		const person = await BaseMember.get(message.member);

		if (person.money < money) throw new ExecuteError(t('error.enough.money'));

		const mult = items.randomByChace().mult;
		const result = Math.round(Number(money) * mult - Number(money));

		person.money += BigInt(result);
		await person.save();

		const embed = this.createEmbed({
			title: t('gambling.casino.title'),
			color: mult <= 1 ? Color.RED : Color.GREEN,
			description:
				mult <= 1
					? t('gambling.casino.lose', {
							bet: Math.abs(result) + ' ' + e(currency),
							mult
					  })
					: t('gambling.casino.win', {
							bet: result + ' ' + e(currency),
							mult
					  }),
			timestamp: null,
			footer: null
		});

		await this.replyAsync(message, embed);
	}
}
