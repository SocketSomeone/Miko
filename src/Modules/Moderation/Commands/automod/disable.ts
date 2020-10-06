import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { EnumResolver, ArrayResolver } from '../../../../Framework/Resolvers';
import { Message } from 'eris';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Violation } from '../../../../Misc/Enums/Violation';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Images } from '../../../../Misc/Enums/Images';
import { BaseModule } from '../../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'automod disable',
			aliases: ['автомод выключить'],
			args: [
				{
					name: 'type',
					resolver: new ArrayResolver(
						module,
						new EnumResolver(module, Object.values(Violation)),
						Object.values(Violation)
					),
					required: false,
					full: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['invites']
		});
	}

	public async execute(message: Message, [types]: [Violation[]], { funcs: { t, e }, guild, settings }: Context) {
		const needToChange = types.filter((x) => settings.autoMod.violations[x] !== false);

		if (needToChange.length < 1) throw new ExecuteError(t('error.changes.not'));

		for (const type of needToChange) {
			settings.autoMod.violations[type] = false;
			await settings.save();
		}

		await this.replyAsync(message, {
			author: {
				name: t('automod.disabled.any'),
				icon_url: Images.SUCCESS
			},
			color: Color.MAGENTA,
			footer: null,
			timestamp: null,
			description: `>>> ${needToChange.map((type) => t(`automod.types.${type}`)).join(', \n')}`
		});
	}
}
