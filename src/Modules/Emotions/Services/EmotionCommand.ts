import { Member, Message } from 'eris';
import { BaseClient } from '../../../Client';
import { Command, Context } from '../../../Framework/Services/Commands/Command';
import { MemberResolver } from '../../../Framework/Resolvers';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';

import i18n from 'i18n';

interface ReactionOptions {
	name: string;
	aliases: string[];
	images: string[];
}

export abstract class EmotionCommand extends Command {
	private images: string[];

	public constructor(client: BaseClient, opts: ReactionOptions) {
		super(client, {
			...opts,
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: false
				}
			],
			examples: ['@user'],
			group: CommandGroup.EMOTIONS,
			premiumOnly: false,
			guildOnly: true
		});

		this.images = opts.images;

		i18n.__({ locale: 'ru', phrase: 'emotions.' + this.name + '.multi' });
		i18n.__({ locale: 'ru', phrase: 'emotions.' + this.name + '.solo' });
	}

	public async execute(message: Message, [member]: [Member], { funcs: { t } }: Context) {
		await this.replyAsync(message, {
			author: {
				icon_url: message.member.avatarURL,
				name: t('emotions.title', {
					name: this.name.toUpperCase()
				})
			},
			description: t(`emotions.${this.name}.${member ? 'multi' : 'solo'}`, {
				m: message.member,
				t: member
			}),
			image: {
				url: this.images.random()
			},
			color: Color.PRIMARY,
			footer: null,
			timestamp: null
		});
	}
}
