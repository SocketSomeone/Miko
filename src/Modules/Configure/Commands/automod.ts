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
			name: 'automod',
			aliases: ['автомод'],
			args: [
				{
					name: 'type',
					resolver: new EnumResolver(client, Object.values(Violation)),
					required: true
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.ADMINISTRATOR],
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [type]: [Violation], { funcs: { t, e }, guild, settings }: Context) {
		settings.autoMod[type] = !settings.autoMod[type];
		await this.client.cache.guilds.updateOne(guild);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(`configure.automod.${type}.${settings.autoMod[type] ? 'enable' : 'disable'}`),
			footer: {
				text: ''
			}
		});
	}
}
