import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Services/Commands/Command';
import { Message } from 'eris';
import { NumberResolver } from '../../../Framework/Resolvers';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';

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
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			examples: ['15']
		});
	}

	public async execute(message: Message, [n]: [number], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const system = this.client.privates;
		const member = message.member;
		const limit = Math.max(0, Math.min(99, n));

		const p = await system.getRoomByVoice(t, guild, member.voiceState.channelID);

		await p.edit(t, member, {
			userLimit: limit
		});

		await this.replyAsync(message, {
			author: {
				name: t(`voice.limit`),
				icon_url: Images.VOICE
			},
			footer: null,
			timestamp: null
		});
	}
}
