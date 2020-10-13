import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { Message, Member, EmbedField } from 'eris';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver } from '../../../../Framework/Resolvers';
import { Images } from '../../../../Misc/Enums/Images';
import { BaseModule } from '../../../../Framework/Module';
import { BaseMember } from '../../../../Entity/Member';

const PUNISHMENT_PER_PAGE = 5;

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'warns',
			aliases: ['преды', 'предупреждения'],
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

	public async execute(message: Message, [target]: [Member], { funcs: { t, e }, guild }: Context) {
		const member = target || message.member;

		const person = await BaseMember.get(member);

		const embed = this.createEmbed({
			color: Color.DARK,
			author: { name: member.tag, icon_url: Images.MODERATION },
			description: t('moderation.warns', {
				count: person.warns.length
			}),
			footer: null,
			timestamp: null
		});

		await this.replyAsync(message, embed);
	}
}
