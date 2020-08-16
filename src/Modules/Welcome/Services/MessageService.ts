import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Member, TextChannel, EmbedOptions } from 'eris';
import { WelcomeChannelType, WelcomeMessage } from '../../../Misc/Enums/WelcomeTypes';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

export class MessageService extends BaseService {
	public async init() {
		this.client.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
	}

	public async onGuildMemberAdd(guild: Guild, { user, mention }: Member) {
		const sets = await this.client.cache.guilds.get(guild.id);

		if (sets.welcomeEnabled !== true) {
			return;
		}

		if (sets.welcomeChannelType === null || sets.welcomeMessageType === null || sets.welcomeMessage === null) {
			return;
		}

		const processed = sets.welcomeMessage
			.replace(/\[members\]/gi, guild.memberCount.toString())
			.replace(/\[mention\]/gi, mention)
			.replace(/\[server\]/gi, guild.name);

		const message =
			sets.welcomeMessageType === WelcomeMessage.TEXT
				? { content: processed }
				: { embed: JSON.parse(processed) as EmbedOptions };

		switch (sets.welcomeChannelType) {
			case WelcomeChannelType.DM: {
				const channel = await user.getDMChannel();

				try {
					await channel.createMessage(message);
				} catch (err) {
					if (err.code === 50007) {
						// NO-OP
					}
				}

				break;
			}

			case WelcomeChannelType.GUILD_CHANNEL: {
				const channel = guild.channels.get(sets.welcomeChannel) as TextChannel;

				if (!channel) {
					return;
				}

				const perm = channel.permissionsOf(this.client.user.id);

				if (!perm.has(GuildPermission.SEND_MESSAGES) || !perm.has(GuildPermission.READ_MESSAGE_HISTORY)) return;

				await channel.createMessage(message);

				break;
			}
		}
	}
}
