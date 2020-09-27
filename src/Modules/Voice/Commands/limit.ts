import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { NumberResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';
import { Service } from '../../../Framework/Decorators/Service';
import { RoomService } from '../Services/RoomService';

export default class extends BaseCommand {
	@Service() protected roomService: RoomService;

	public constructor(module: BaseModule) {
		super(module, {
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
		const member = message.member;
		const limit = Math.max(0, Math.min(99, n));

		const p = await this.roomService.getRoomByVoice(t, guild, member.voiceState.channelID);

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
