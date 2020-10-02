import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message, Member, Role } from 'eris';
import { AnyResolver, RoleResolver, MemberResolver } from '../../../Framework/Resolvers';
import { ActionRoom } from '../../../Entity/Privates';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';
import { RoomService } from '../Services/RoomService';
import { Service } from '../../../Framework/Decorators/Service';

export default class extends BaseCommand {
	@Service() protected roomService: RoomService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'voice hide',
			aliases: ['v hide'],
			args: [
				{
					name: 'role | member',
					resolver: new AnyResolver(module, RoleResolver, MemberResolver),
					required: false
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			examples: ['@role', '@user']
		});
	}

	public async execute(
		message: Message,
		[target]: [Role | Member],
		{ funcs: { t }, guild, settings: { prefix } }: Context
	) {
		const member = message.member;
		const p = await this.roomService.getRoomByVoice(t, guild, member.voiceState.channelID);

		await p.actionRoom(t, member, target || guild, ActionRoom.HIDE, false);

		await this.replyAsync(message, {
			author: {
				name: t(`voice.hidden`, {
					target: (target && target.name.substring(0, 40)) || t('voice.all')
				}),
				icon_url: Images.VOICE
			},
			footer: null,
			timestamp: null
		});
	}
}
