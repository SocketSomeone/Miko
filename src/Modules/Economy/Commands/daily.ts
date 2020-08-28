import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

import moment from 'moment';

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

	public async execute({ member, channel }: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		const person = await BaseMember.get(member);

		if (moment().isBefore(person.timelyAt))
			throw new ExecuteError(
				t('economy.daily.wait', {
					timeout: moment.duration(person.timelyAt.diff(moment())).humanize(false)
				})
			);

		person.money += BigInt(settings.prices.timely);
		person.timelyAt = moment().add(24, 'h');
		await person.save();

		await this.sendAsync(channel, t, {
			author: { name: t('economy.daily.title'), icon_url: Images.TIME },
			thumbnail: { url: member.avatarURL },
			description: t('economy.daily.desc', {
				member: member,
				amount: `${settings.prices.timely} ${e(settings.currency)}`,
				timeout: moment.duration(person.timelyAt.diff(moment())).humanize(false)
			}),
			timestamp: null,
			footer: null
		});
	}
}
