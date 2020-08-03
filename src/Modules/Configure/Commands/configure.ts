import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'configure',
			aliases: ['conf', 'configuration', 'конфигурация'],
			args: [],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_GUILD],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, []: [], { funcs: { t, e }, guild, settings }: Context) {
		await this.replyAsync(message, t, {
			color: ColorResolve(Color.GRAY),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(`configure.autosave.${settings.saveroles ? 'enable' : 'disable'}`),
			footer: {
				text: ''
			}
		});
	}
}
