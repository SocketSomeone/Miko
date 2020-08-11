import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Emoji } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BigIntResolver } from '../../../Framework/Resolvers';
import { SlotMachine } from 'slot-machine';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

import slotSymbols from '../Misc/slot-symbols';

const machine = new SlotMachine(3, slotSymbols);

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'slotmachine',
			aliases: ['slots', 'spin'],
			args: [
				{
					name: 'money',
					resolver: new BigIntResolver(client, 1n),
					required: true
				}
			],
			group: CommandGroup.GAMBLING,
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(
		message: Message,
		[money]: [bigint],
		{ funcs: { t, e }, guild, settings: { currency } }: Context
	) {
		const person = await BaseMember.get(message.member);

		if (person.money < money)
			throw new ExecuteError(
				t('error.enough.money', {
					emoji: e(currency),
					amount: money - person.money
				})
			);

		const times = BigInt(3) * money;
		const result = machine.play();
		const winned = times * BigInt(result.totalPoints);
		const isWon = result.winCount > 0;

		person.money += winned - money;
		await person.save();

		const embed = await this.createEmbed({
			title: t('gambling.slots.title'),
			description: t('gambling.slots.desc', {
				result: result.visualize(false)
			}),
			color: ColorResolve(isWon ? Color.GREEN : Color.RED),
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

		await this.replyAsync(message, t, embed);
	}
}
