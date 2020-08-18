import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member, Role } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { AnyResolver, RoleResolver, MemberResolver } from '../../../Framework/Resolvers';
import { ActionRoom } from '../../../Entity/Privates';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice kick',
			aliases: ['v kick'],
			group: CommandGroup.VOICE,
			args: [],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MOVE_MEMBERS]
		});
	}

	public async execute(message: Message, [target]: [Member], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		await p.kickUser(t, member, target);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('voice.title'),
			description: t(`voice.kick`, {
				member: member.mention,
				target: target.mention
			})
		});
	}
}
