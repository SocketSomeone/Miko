import { BaseModule } from '../../../Framework/Module';
import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { MemberResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Images } from '../../../Misc/Enums/Images';
import { Service } from '../../../Framework/Decorators/Service';
import { RoomService } from '../Services/RoomService';

export default class extends BaseCommand {
	@Service() protected roomService: RoomService;

	public constructor(module: BaseModule) {
		super(module, {
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
			premiumOnly: false,
			examples: ['@user']
		});
	}

	public async execute(message: Message, [user]: [Member], { funcs: { t }, guild, settings }: Context) {
		const member = message.member;

		const p = await this.roomService.getRoomByVoice(t, guild, member.voiceState.channelID);

		const newAdmin = await p.actionAdmin(t, member, user);

		await this.replyAsync(message, {
			author: {
				name: t(`voice.admin.${newAdmin ? 'setted' : 'deleted'}`),
				icon_url: Images.VOICE
			},
			footer: null,
			timestamp: null
		});
	}
}
