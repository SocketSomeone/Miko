import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { MemberResolver, NumberResolver } from '../../../Framework/Resolvers';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

import moment from 'moment';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice limit',
			aliases: ['v limit'],
			group: CommandGroup.VOICE,
			args: [
				{
					name: 'limit',
					resolver: NumberResolver,
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS]
		});
	}

	public async execute(message: Message, [n]: [number], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const system = this.client.privates;
		const member = message.member;
		const limit = Math.max(0, Math.min(99, n));

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		await p.edit(t, member, {
			userLimit: limit
		});

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('voice.title'),
			description: t('voice.limit')
		});
	}
}
