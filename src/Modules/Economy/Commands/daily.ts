import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

import moment from 'moment';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'daily',
			aliases: ['timely', 'награда'],
			group: CommandGroup.ECONOMY,
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		const person = await BaseMember.get(message.member);

		if (moment().isBefore(person.timelyAt))
			throw new ExecuteError({
				title: t('modules.economy.daily.wait.title'),
				description: t('modules.economy.daily.wait.desc', {
					timeout: moment.duration(person.timelyAt.diff(moment())).humanize(false)
				})
			});

		person.money = person.money.plus(settings.prices.timely);
		person.timelyAt = moment().add(24, 'h');
		await person.save();

		await this.sendAsync(message.channel, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('modules.economy.daily.title'),
			description: t('modules.economy.daily.desc', {
				member: message.member.mention,
				amount: `${settings.prices.timely} ${e(settings.emojis.wallet)}`
			})
		});
	}
}
