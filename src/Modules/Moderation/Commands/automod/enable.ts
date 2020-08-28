import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { EnumResolver } from '../../../../Framework/Resolvers';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Violation } from '../../../../Misc/Enums/Violation';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Images } from '../../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'automod enable',
			aliases: ['автомод включить'],
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
		if (settings.autoMod[type] === true)
			throw new ExecuteError(t('automod.enabled.already', { type: t(`automod.types.${type}`) }));

		settings.autoMod[type] = true;
		await settings.save();

		await this.replyAsync(message, t, {
			author: {
				name: t('automod.title'),
				icon_url: Images.SUCCESS
			},
			color: Color.MAGENTA,
			footer: null,
			timestamp: null,
			description: t('automod.enabled.any', { type: t(`automod.types.${type}`) })
		});
	}
}
