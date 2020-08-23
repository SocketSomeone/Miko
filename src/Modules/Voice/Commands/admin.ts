import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { MemberResolver, NumberResolver } from '../../../Framework/Resolvers';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

import moment from 'moment';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

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
			premiumOnly: false
		});
	}

	public async execute(message: Message, [user]: [Member], { funcs: { t }, guild, settings }: Context) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		const newAdmin = await p.actionAdmin(t, member, user);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('voice.title'),
			description: t(`voice.admin.${newAdmin ? 'setted' : 'deleted'}`)
		});
	}
}
