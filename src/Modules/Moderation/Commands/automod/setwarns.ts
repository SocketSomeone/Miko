import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { DurationResolver, EnumResolver, NumberResolver } from '../../../../Framework/Resolvers';
import { Message } from 'eris';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Violation } from '../../../../Misc/Enums/Violation';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Images } from '../../../../Misc/Enums/Images';
import { BaseModule } from '../../../../Framework/Module';
import { Punishment } from '../../../../Entity/Punishment';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'setwarns',
			aliases: [],
			args: [
				{
					name: 'amount',
					resolver: NumberResolver,
					required: true
				},
				{
					name: 'punishment',
					resolver: new EnumResolver(module, Object.keys(Punishment)),
					required: true
				},
				{
					name: 'duration',
					resolver: DurationResolver,
					required: false
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['4 ban', '12 mute 5m']
		});
	}

	public async execute(message: Message, [types]: [Violation[]], { funcs: { t, e }, guild, settings }: Context) {
		const needToChange = types.filter((x) => settings.autoMod.violations[x] !== true);

		if (needToChange.length < 1) throw new ExecuteError(t('error.changes.not'));

		for (const type of needToChange) {
			settings.autoMod.violations[type] = true;
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
