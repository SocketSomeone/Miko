import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { StringResolver } from '../../../Framework/Resolvers';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice name',
			aliases: ['v name'],
			group: CommandGroup.VOICE,
			args: [
				{
					name: 'name',
					resolver: StringResolver,
					required: true,
					full: true
				}
			],
			guildOnly: true,
			premiumOnly: false
		});
	}

	public async execute(message: Message, [name]: [string], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const system = this.client.privates;
		const member = message.member;

		const p = await system.getRoomByVoice(t, member.voiceState.channelID);

		await system.editRoom(t, p, member, {
			name: name.substr(0, 24)
		});

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.PRIMARY),
			title: t('voice.title'),
			description: t('voice.name')
		});
	}
}
