import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { MemberResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice admin',
			aliases: ['v admin'],
			group: CommandGroup.VOICE,
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

	public async execute(message: Message, [user]: [Member], { funcs: { t }, guild, settings }: Context) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		const newAdmin = await p.actionAdmin(t, member, user);

		await this.replyAsync(message, t, {
			author: {
				name: t(`voice.admin.${newAdmin ? 'setted' : 'deleted'}`),
				icon_url: Images.VOICE
			},
			footer: null,
			timestamp: null
		});
	}
}
