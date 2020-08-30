import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { EnumResolver, ArrayResolver } from '../../../../Framework/Resolvers';
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
			name: 'automod disable',
			aliases: ['автомод выключить'],
			args: [
				{
					name: 'type',
					resolver: new ArrayResolver(
						client,
						new EnumResolver(client, Object.values(Violation)),
						Object.values(Violation)
					),
					required: false,
					full: true
				}
			],
			group: CommandGroup.MODERATION,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['invites']
		});
	}

	public async execute(message: Message, [types]: [Violation[]], { funcs: { t, e }, guild, settings }: Context) {
		const needToChange = types.filter((x) => settings.autoMod[x] !== false);

		if (needToChange.length < 1) throw new ExecuteError(t('error.changes.not'));

		for (const type of needToChange) {
			settings.autoMod[type] = false;
			await settings.save();
		}

		await this.replyAsync(message, t, {
			author: {
				name: t('automod.title'),
				icon_url: Images.SUCCESS
			},
			color: Color.MAGENTA,
			footer: null,
			timestamp: null,
			description: t('automod.disabled.any', {
				types: needToChange.map((type) => t(`automod.types.${type}`)).join(', \n')
			})
		});
	}
}
