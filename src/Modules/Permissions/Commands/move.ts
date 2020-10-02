import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { NumberResolver } from '../../../Framework/Resolvers';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Color } from '../../../Misc/Enums/Colors';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'permission move',
			aliases: [],
			args: [
				{
					name: 'number',
					resolver: new NumberResolver(module, 1),
					required: true
				},
				{
					name: 'number',
					resolver: new NumberResolver(module, 1),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['1 2']
		});
	}

	public async execute(
		message: Message,
		[targetId, sourceId]: [number, number],
		{ funcs: { t }, guild, settings }: Context
	) {
		const permissions = settings.permissions;

		const target = permissions[targetId - 1];
		const source = permissions[sourceId - 1];

		if (typeof target === 'undefined') throw new ExecuteError(t('perms.notFound'));
		if (typeof source === 'undefined') throw new ExecuteError(t('perms.sourceNotFound'));

		target.index = sourceId;
		source.index = targetId;

		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t('perms.title'), icon_url: Images.SUCCESS },
			description: t('perms.move', {
				target: targetId,
				source: sourceId
			})
		});
	}
}
