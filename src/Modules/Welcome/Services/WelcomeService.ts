import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Member, TextChannel, EmbedOptions } from 'eris';
import { WelcomeChannelType } from '../../../Misc/Enums/WelcomeTypes';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

import i18n from 'i18n';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Cache } from '../../../Framework/Decorators/Cache';
import { GuildSettingsCache } from '../../../Framework/Cache';
import { Service } from '../../../Framework/Decorators/Service';
import { MessagingService } from '../../../Framework/Services/Messaging';

export class WelcomeService extends BaseService {
	@Service() messages: MessagingService;
	@Cache() guilds: GuildSettingsCache;

	public async init() {
		this.client.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
	}

	public async onGuildMemberAdd(guild: Guild, { user, mention }: Member) {
		const sets = await this.guilds.get(guild);

		if (sets.welcome.enabled !== true || sets.welcome.channelType === null || sets.welcome.message === null) {
			return;
		}

		const message = this.messages.fillTemplate(sets.welcome.message, {
			members: guild.memberCount,
			server: guild.name,
			mention
		});

		switch (sets.welcome.channelType) {
			case WelcomeChannelType.DM: {
				const channel = await user.getDMChannel();

				await this.messages.sendEmbed(channel, message).catch(() => undefined);

				break;
			}

			case WelcomeChannelType.GUILD_CHANNEL: {
				const channel = guild.channels.get(sets.welcome.channel) as TextChannel;

				if (!channel) {
					return;
				}

				const perm = channel.permissionsOf(this.client.user.id);

				if (!perm.has(GuildPermission.SEND_MESSAGES) || !perm.has(GuildPermission.READ_MESSAGE_HISTORY)) return;

				await this.messages.sendEmbed(channel, message).catch(() => undefined);

				break;
			}
		}
	}
}
