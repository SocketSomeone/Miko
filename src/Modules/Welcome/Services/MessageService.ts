import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Member, TextChannel, EmbedOptions } from 'eris';
import { WelcomeChannelType } from '../../../Misc/Enums/WelcomeTypes';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

import i18n from 'i18n';
import { TranslateFunc } from '../../../Framework/Commands/Command';

export class MessageService extends BaseService {
	public async init() {
		this.client.on('guildMemberAdd', this.onGuildMemberAdd.bind(this));
	}

	public async onGuildMemberAdd(guild: Guild, { user, mention }: Member) {
		const sets = await this.client.cache.guilds.get(guild.id);

		if (sets.welcomeEnabled !== true || sets.welcomeChannelType === null || sets.welcomeMessage === null) {
			return;
		}

		const message = this.client.messages.fillTemplate(sets.welcomeMessage, {
			members: guild.memberCount,
			server: guild.name,
			mention
		});

		const t: TranslateFunc = (key, replace) => i18n.__({ locale: sets.locale, phrase: key }, replace);

		switch (sets.welcomeChannelType) {
			case WelcomeChannelType.DM: {
				const channel = await user.getDMChannel();

				await this.client.messages.sendEmbed(channel, t, message).catch(undefined);

				break;
			}

			case WelcomeChannelType.GUILD_CHANNEL: {
				const channel = guild.channels.get(sets.welcomeChannel) as TextChannel;

				if (!channel) {
					return;
				}

				const perm = channel.permissionsOf(this.client.user.id);

				if (!perm.has(GuildPermission.SEND_MESSAGES) || !perm.has(GuildPermission.READ_MESSAGE_HISTORY)) return;

				await this.client.messages.sendEmbed(channel, t, message).catch(undefined);

				break;
			}
		}
	}
}
