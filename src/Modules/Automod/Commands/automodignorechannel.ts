import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, EnumResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import { Violation } from '../../../Misc/Models/Violation';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'automodignorechannel',
			aliases: ['amic'],
			args: [],
			group: CommandGroup.AUTOMOD,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.ADMINISTRATOR],
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		if (settings.autoModIgnoreChannels.includes(message.channel.id)) {
			settings.autoModIgnoreChannels.splice(
				settings.autoModIgnoreChannels.findIndex((x) => x === message.channel.id),
				1
			);
		} else {
			settings.autoModIgnoreChannels.push(message.channel.id);
		}

		await settings.save();

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('automod.title', {
				guild: guild.name
			}),
			description: t(
				`automod.${settings.autoModIgnoreChannels.includes(message.channel.id) ? 'enabled' : 'disabled'}.amic`,
				{
					channel: message.channel.mention
				}
			),
			footer: {
				text: ''
			}
		});
	}
}
