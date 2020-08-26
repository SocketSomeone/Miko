import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { StringResolver, EnumResolver } from '../../../../Framework/Resolvers';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Violation } from '../../../../Misc/Enums/Violation';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'automod disable',
			aliases: ['автомод выключить'],
			args: [
				{
					name: 'type',
					resolver: new EnumResolver(client, Object.values(Violation)),
					required: true
				}
			],
			group: CommandGroup.MODERATION,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.ADMINISTRATOR],
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [type]: [Violation], { funcs: { t, e }, guild, settings }: Context) {
		if (settings.autoMod[type] !== true) throw new ExecuteError(t('automod.alreadyDisabled'));

		settings.autoMod[type] = false;
		await settings.save();

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('automod.title'),
			description: t(`automod.disabled.${type}`),
			footer: {
				text: ''
			}
		});
	}
}
