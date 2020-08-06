import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { MemberResolver } from '../../../Framework/Resolvers';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

import moment from 'moment';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'warns',
			aliases: ['преды'],
			group: CommandGroup.INFO,
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: false
				}
			],
			guildOnly: false,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [user]: [Member], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const member = user || message.member;
		const person = await BaseMember.get(member);

		person.warns = person.warns.filter((x) => moment().isBefore(x.expireAt));

		const embed = this.createEmbed(
			{
				color: ColorResolve(Color.MAGENTA),
				author: {
					name: member.username + `#` + member.discriminator,
					icon_url: member.avatarURL
				},
				thumbnail: {
					url: guild.iconURL
				},
				footer: {
					text: null
				}
			},
			false
		);

		if (person.warns.length < 1) {
			embed.description = t('info.warns.no');
		} else {
			const title = t('info.warns.has');
			const side = '⠀'.repeat(~~((44 - title.length) / 2));

			embed.fields = [
				{
					name: `${side}${title}${side}`,
					value: `\n${person.warns
						.slice(0, 10)
						.map(
							(x) =>
								`${moment(x.createdAt).format('DD.MM.YYYY')} | **${x.reason}** ${t('info.warns.by')} <@!${x.moderator}>`
						)
						.join('\n')}`
				}
			];
		}

		await this.replyAsync(message, t, embed);
	}
}
