import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'prefix',
			aliases: ['префикс'],
			args: [
				{
					name: 'new-prefx',
					resolver: StringResolver,
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [prefix]: [string], { funcs: { t, e }, guild, settings }: Context) {
		if (prefix && prefix.length) {
			settings.prefix = prefix;
			await this.client.cache.guilds.updateOne(guild);
		}

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('modules.configure.title', {
				guild: guild.name
			}),
			description: t(`modules.configure.prefix.${prefix && prefix.length ? 'new' : 'info'}`, {
				prefix: settings.prefix
			})
		});
	}
}
