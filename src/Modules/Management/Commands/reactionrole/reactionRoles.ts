import { BaseClient } from '../../../../Client';
import { Context, Command } from '../../../../Framework/Commands/Command';
import { Message, Role } from 'eris';
import { StringResolver, RoleResolver } from '../../../../Framework/Resolvers';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../../Misc/Enums/GuildPermissions';
import { BaseMessage } from '../../../../Entity/Message';
import { ReactionRoleService } from '../../Services/ReactionRoles';
import { BaseReactionRole } from '../../../../Entity/ReactionRole';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';

const CUSTOM_EMOJI_REGEX = /<(?:.*)?:(\w+):(\d+)>/;

export default class extends Command {
	protected service: ReactionRoleService;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'reactionrole',
			aliases: ['rr'],
			group: CommandGroup.MANAGEMENT,
			args: [
				{
					name: 'messageId',
					resolver: StringResolver,
					required: true
				},
				{
					name: 'emoji',
					resolver: StringResolver,
					required: true
				},
				{
					name: 'role',
					resolver: RoleResolver,
					required: true
				}
			],
			guildOnly: true,
			botPermissions: [GuildPermission.MANAGE_MESSAGES],
			userPermissions: [GuildPermission.MANAGE_MESSAGES],
			premiumOnly: false
		});

		this.service = new ReactionRoleService(client);
	}

	public async onLoaded() {
		await this.service.init();
	}

	public async execute(
		message: Message,
		[messageId, emoji, role]: [string, string, Role],
		{ funcs: { t }, guild }: Context
	): Promise<any> {
		const dbMessage = await BaseMessage.findOne({
			where: {
				guildId: guild.id,
				id: messageId
			}
		});

		if (!dbMessage) {
			throw new ExecuteError({
				title: t('manage.reactionrole.notFound.title'),
				description: t('manage.reactionrole.notFound.desc')
			});
		}

		const matches = emoji.match(CUSTOM_EMOJI_REGEX);
		const emojiId = matches ? `${matches[1]}:${matches[2]}` : emoji;

		try {
			await this.client.addMessageReaction(dbMessage.channelId, dbMessage.id, emojiId);
			await BaseReactionRole.save(
				BaseReactionRole.create({
					guildId: dbMessage.guildId,
					channelId: dbMessage.channelId,
					messageId: dbMessage.id,
					roleId: role.id,
					emoji: emojiId
				})
			);
		} catch (error) {
			if (error.code === 10014) {
				throw new ExecuteError(t('manage.reactionrole.unknownEmoji'));
			} else {
				throw error;
			}
		}

		this.service.cache.flush(guild.id);

		await this.client.addMessageReaction(message.channel.id, message.id, '👌🏼');
	}
}
