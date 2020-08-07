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
			group: CommandGroup.CONFIGURE,
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

		await this.client.cache.guilds.updateOne(guild);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(
				`configure.automod.amic.${settings.autoModIgnoreChannels.includes(message.channel.id) ? 'added' : 'deleted'}`,
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
