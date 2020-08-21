import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member, TextChannel } from 'eris';
import { MemberResolver, ChannelResolver } from '../../../Framework/Resolvers';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

import moment from 'moment';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'log enable',
			aliases: [],
			group: CommandGroup.LOG,
			args: [],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.VIEW_AUDIT_LOGS],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [], { funcs: { t }, guild, settings }: Context) {
		settings.loggerEnabled = true;
		await settings.save();

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('logs.title'),
			description: t(`logs.enable`),
			footer: {
				text: ''
			}
		});
	}
}
