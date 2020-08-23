import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member, Role } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { MemberResolver } from '../../../Framework/Resolvers';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice owner',
			aliases: ['v owner'],
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
			botPermissions: [GuildPermission.MANAGE_CHANNELS]
		});
	}

	public async execute(message: Message, [target]: [Member], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		await p.setOwner(t, member, target);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('voice.title'),
			description: t(`voice.owner`, {
				member: member.mention,
				target: target.mention
			})
		});
	}
}
