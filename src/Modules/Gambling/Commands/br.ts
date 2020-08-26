import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Emoji } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { chance } from '../../../Misc/Utils/Chance';
import { BigIntResolver } from '../../../Framework/Resolvers';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'br',
			aliases: [],
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

		person.money -= money;

		const int = chance.integer({ min: 0, max: 100 });

		const embed = this.createEmbed({
			title: t('gambling.br.title'),
			color: ColorResolve(Color.GREEN),
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
			embed.color = ColorResolve(Color.RED);
		}

		await person.save();
		await this.replyAsync(message, t, embed);
	}
}
