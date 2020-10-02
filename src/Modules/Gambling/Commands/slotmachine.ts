import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BigIntResolver } from '../../../Framework/Resolvers';
import { SlotMachine } from 'slot-machine';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

import slotSymbols from '../Others/slot-symbols';
import { BaseModule } from '../../../Framework/Module';

const machine = new SlotMachine(3, slotSymbols);

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'slotmachine',
			aliases: ['slots', 'spin'],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(module, 30n),
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

		const times = 3n * money;
		const result = machine.play();
		const winned = (times * BigInt(result.totalPoints)) >> 2n;
		const isWon = result.winCount > 0;

		person.money += winned - money;
		await person.save();

		const embed = this.createEmbed({
			title: t('gambling.slots.title'),
			description: t('gambling.slots.desc', {
				result: result.visualize(false)
			}),
			color: isWon ? Color.GREEN : Color.RED,
			fields: [
				{
					name: t('gambling.slots.fields.bet'),
					value: `${money} ${e(currency)}`,
					inline: true
				},
				{
					name: t('gambling.slots.fields.result'),
					value: `${winned} ${e(currency)}`,
					inline: true
				}
			]
		});

		await this.replyAsync(message, embed);
	}
}
