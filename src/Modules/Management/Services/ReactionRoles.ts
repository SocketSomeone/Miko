import { BaseService } from '../../../Framework/Services/Service';
import { PossiblyUncachedMessage, Emoji, TextChannel } from 'eris';
import { BaseClient } from '../../../Client';
import { ReactionRoleCache } from '../Cache/ReactionRole';

export class ReactionRoleService extends BaseService {
	private cache: ReactionRoleCache;

	public constructor(client: BaseClient) {
		super(client);

		this.cache = new ReactionRoleCache(client);
	}

	public async init() {
		this.client.on('messageReactionAdd', this.onMessageReactionAdd.bind(this));
		this.client.on('messageReactionRemove', this.onMessageReactionRemove.bind(this));
	}

	public async onMessageReactionAdd(message: PossiblyUncachedMessage, emoji: Emoji, userId: string) {
		if (message.channel instanceof TextChannel) {
			const reactionRoles = await this.cache.get(message.channel.guild.id);

			const reactionRole = reactionRoles.find((role) => {
				if (role.channelId !== message.channel.id || role.messageId !== message.id) {
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
				await this.client.addGuildMemberRole(message.channel.guild.id, userId, reactionRole.roleId);
			}
		}
	}

	public async onMessageReactionRemove(message: PossiblyUncachedMessage, emoji: Emoji, userId: string) {
		if (message.channel instanceof TextChannel) {
			const reactionRoles = await this.cache.get(message.channel.guild.id);

			const reactionRole = reactionRoles.find((role) => {
				if (role.channelId !== message.channel.id || role.messageId !== message.id) {
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
				await this.client.removeGuildMemberRole(message.channel.guild.id, userId, reactionRole.roleId);
			}
		}
	}
}
