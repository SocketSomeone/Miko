import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Member, TextChannel } from 'eris';
import { WelcomeChannelType } from '../../../Misc/Models/WelcomeTypes';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

export class MessageService extends BaseService {
	public async init() {
		this.client.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
	}

	public async onGuildMemberAdd(guild: Guild, { user }: Member) {
		const sets = await this.client.cache.guilds.get(guild.id);

		if (sets.welcomeEnabled !== true) {
			return;
		}

		const embed = this.client.messages.createEmbed({
			title: '123'
		});

		switch (sets.welcomeChannelType) {
			case WelcomeChannelType.DM: {
				const channel = await user.getDMChannel();

				try {
					await channel.createMessage({ embed });
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

				await channel.createMessage({ embed });

				break;
			}
		}
	}
}
