import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, ChannelResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Channel } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'modlog',
			aliases: [],
			args: [
				{
					name: 'channel',
					resolver: ChannelResolver,
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [channel]: [Channel], { funcs: { t, e }, guild, settings }: Context) {
		if (channel) {
			settings.modlog = channel.id;
			await this.client.cache.guilds.updateOne(guild);
		}

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: settings.modlog
				? t(`configure.modlog.${channel ? 'new' : 'info'}`, {
						channel: channel.mention
				  })
				: t('configure.modlog.notFound'),
			footer: {
				text: ''
			}
		});
	}
}
