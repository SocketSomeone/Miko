import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

import moment from 'moment';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice hide',
			aliases: ['v hide'],
			group: CommandGroup.VOICE,
			args: [],
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		await p.hideRoom(t, member);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('voice.title'),
			description: t(`voice.hidden`)
		});
	}
}
