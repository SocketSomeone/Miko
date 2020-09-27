import { BaseClient } from '../../../Client';
import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { Service } from '../../../Framework/Decorators/Service';
import { RoomService } from '../Services/RoomService';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	@Service() protected roomService: RoomService;

	public constructor(module: BaseModule) {
		super(module, {
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
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			examples: ['🌟 Shines like a star']
		});
	}

	public async execute(message: Message, [name]: [string], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const member = message.member;
		const p = await this.roomService.getRoomByVoice(t, guild, member.voiceState.channelID);

		await p.edit(t, member, {
			name: name.substr(0, 24)
		});

		await this.replyAsync(message, {
			author: {
				name: t('voice.name'),
				icon_url: Images.VOICE
			},
			footer: null,
			timestamp: null
		});
	}
}
