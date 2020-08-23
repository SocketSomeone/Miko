import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { NumberResolver } from '../../../Framework/Resolvers';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'permission move',
			aliases: [],
			group: CommandGroup.PERMISSIONS,
			args: [
				{
					name: 'number',
					resolver: new NumberResolver(client, 1),
					required: true
				},
				{
					name: 'number',
					resolver: new NumberResolver(client, 1),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(
		message: Message,
		[targetId, sourceId]: [number, number],
		{ funcs: { t }, guild, settings }: Context
	) {
		const permissions = await this.client.cache.permissions.get(guild.id);

		const target = permissions[targetId - 1];
		const source = permissions[sourceId - 1];

		if (typeof target === 'undefined') throw new ExecuteError(t('perms.notFound'));
		if (typeof source === 'undefined') throw new ExecuteError(t('perms.sourceNotFound'));

		target.index = sourceId;
		source.index = targetId;

		await this.client.cache.permissions.save(guild.id, permissions);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('perms.title'),
			description: t('perms.move', {
				target: targetId,
				source: sourceId
			})
		});
	}
}
