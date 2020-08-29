import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { MemberResolver } from '../../../Framework/Resolvers';
import { BaseMember } from '../../../Entity/Member';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

import moment from 'moment';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'warns',
			aliases: ['преды'],
			group: CommandGroup.MODERATION,
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: false
				}
			],
			guildOnly: true,
			premiumOnly: false,
			examples: ['@user']
		});
	}

	public async execute(message: Message, [user]: [Member], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const member = user || message.member;
		const person = await BaseMember.get(member);

		person.warns = person.warns.filter((x) => moment().isBefore(x.expireAt));

		if (person.warns.length < 1) throw new ExecuteError(t('info.warns.no'));

		const embed = this.createEmbed({
			color: Color.MAGENTA,
			description: member.mention,
			footer: null,
			thumbnail: {
				url: member.avatarURL
			},
			author: {
				name: t('info.warns.list'),
				icon_url: Images.LIST
			},
			fields: [
				{
					name: t('info.warns.has'),
					value: person.warns
						.sort((a, b) => moment(b.expireAt).valueOf() - moment(a.expireAt).valueOf())
						.slice(0, 10)
						.map(
							(x) =>
								`${moment(x.createdAt).format('DD.MM.YYYY')} | **${x.reason}** ${t('info.warns.by')} <@!${x.moderator}>`
						)
						.join('\n')
				}
			]
		});

		await this.replyAsync(message, t, embed);
	}
}
