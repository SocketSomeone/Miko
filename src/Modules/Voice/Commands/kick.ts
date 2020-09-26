import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Services/Commands/Command';
import { Message, Member } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { MemberResolver } from '../../../Framework/Resolvers';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice kick',
			aliases: ['v kick'],
			group: CommandGroup.VOICE,
			args: [
				{
					name: 'member',
					resolver: MemberResolver,
					required: false
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MOVE_MEMBERS],
			examples: ['@user']
		});
	}

	public async execute(message: Message, [target]: [Member], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, guild, member.voiceState.channelID);

		await p.kickUser(t, member, target);

		await this.replyAsync(message, {
			author: {
				name: t(`voice.kick`, {
					member: member.tag,
					target: target.tag
				}),
				icon_url: Images.VOICE
			},
			footer: null,
			timestamp: null
		});
	}
}
