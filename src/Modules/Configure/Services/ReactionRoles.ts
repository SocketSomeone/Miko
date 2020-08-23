import { BaseService } from '../../../Framework/Services/Service';
import { PossiblyUncachedMessage, Emoji, TextChannel } from 'eris';
import { BaseClient } from '../../../Client';
import { ReactionRoleCache } from '../Cache/ReactionRole';

export class ReactionRoleService extends BaseService {
	public cache: ReactionRoleCache;

	public constructor(client: BaseClient) {
		super(client);

		this.cache = new ReactionRoleCache(client);
	}

	public async init() {
		this.client.on('messageReactionAdd', this.onMessageReactionAdd.bind(this));
		this.client.on('messageReactionRemove', this.onMessageReactionRemove.bind(this));
	}

	public async onMessageReactionAdd({ channel, id }: PossiblyUncachedMessage, emoji: Emoji, userId: string) {
		if (channel instanceof TextChannel) {
			const reactionRoles = await this.cache.get(channel.guild.id);

			const reactionRole = reactionRoles.find((role) => {
				if (role.channelId !== channel.id || role.messageId !== id) {
					return false;
				}

				const splits = role.emoji.split(':');

				if (splits.length === 1) {
					return emoji.name === splits[0];
				} else {
					return emoji.name === splits[0] && emoji.id === splits[1];
				}
			});

			if (reactionRole) {
				await this.client.addGuildMemberRole(channel.guild.id, userId, reactionRole.roleId);
			}
		}
	}

	public async onMessageReactionRemove({ channel, id }: PossiblyUncachedMessage, emoji: Emoji, userId: string) {
		if (channel instanceof TextChannel) {
			const reactionRoles = await this.cache.get(channel.guild.id);

			const reactionRole = reactionRoles.find((role) => {
				if (role.channelId !== channel.id || role.messageId !== id) {
					return false;
				}

				const splits = role.emoji.split(':');
				if (splits.length === 1) {
					return emoji.name === splits[0];
				} else {
					return emoji.name === splits[0] && emoji.id === splits[1];
				}
			});

			if (reactionRole) {
				await this.client.removeGuildMemberRole(channel.guild.id, userId, reactionRole.roleId);
			}
		}
	}
}
