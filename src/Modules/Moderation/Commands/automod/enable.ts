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
			name: 'automod enable',
			aliases: ['автомод включить'],
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
			botPermissions: [GuildPermission.MANAGE_MESSAGES],
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['invites', 'caps, mentions']
		});
	}

	public async execute(message: Message, [types]: [Violation[]], { funcs: { t, e }, guild, settings }: Context) {
		const needToChange = types.filter((x) => settings.autoMod[x] !== true);

		if (needToChange.length < 1) throw new ExecuteError(t('error.changes.not'));

		for (const type of needToChange) {
			settings.autoMod[type] = true;
			await settings.save();
		}

		await this.replyAsync(message, {
			author: {
				name: t('automod.enabled.any'),
				icon_url: Images.SUCCESS
			},
			color: Color.MAGENTA,
			footer: null,
			timestamp: null,
			description: `>>> ${needToChange.map((type) => t(`automod.types.${type}`)).join(', \n')}`
		});
	}
}
