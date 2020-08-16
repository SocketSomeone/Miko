import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member, Role } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { AnyResolver, RoleResolver, MemberResolver } from '../../../Framework/Resolvers';
import { ActionRoom } from '../../../Entity/Privates';

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
			premiumOnly: false
		});
	}

	public async execute(
		message: Message,
		[target]: [Role | Member],
		{ funcs: { t }, guild, settings: { prefix } }: Context
	) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		await p.actionRoom(t, member, target || guild, ActionRoom.HIDE, false);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('voice.title'),
			description: t(`voice.hidden`, {
				target: (target && target.mention) || t('voice.all')
			})
		});
	}
}
