import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member, Role } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { AnyResolver, RoleResolver, MemberResolver } from '../../../Framework/Resolvers';
import { ActionRoom } from '../../../Entity/Privates';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice hide',
			aliases: ['v hide'],
			group: CommandGroup.VOICE,
			args: [
				{
					name: 'role/member',
					resolver: new AnyResolver(client, RoleResolver, MemberResolver),
					required: false
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			examples: ['@role', '@user']
		});
	}

	public async execute(
		message: Message,
		[target]: [Role | Member],
		{ funcs: { t }, guild, settings: { prefix } }: Context
	) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, guild, member.voiceState.channelID);

		await p.actionRoom(t, member, target || guild, ActionRoom.HIDE, false);

		await this.replyAsync(message, t, {
			author: {
				name: t(`voice.hidden`, {
					target: (target && target.name.substring(0, 40)) || t('voice.all')
				}),
				icon_url: Images.VOICE
			},
			footer: null,
			timestamp: null
		});
	}
}
