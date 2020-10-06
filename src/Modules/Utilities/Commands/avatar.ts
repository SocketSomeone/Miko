import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Member, Message } from 'eris';
import { MemberResolver } from '../../../Framework/Resolvers';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'avatar',
			aliases: ['ава', 'ava', 'аватарка'],
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			examples: ['@user']
		});
	}

	public async execute(message: Message, [member]: [Member], {}: Context) {
		await this.replyAsync(message, {
			author: { name: member.tag, icon_url: message.author.avatarURL },
			image: { url: member.avatarURL }
		});
	}
}
