import { Guild, Role } from 'eris';
import { ModerationService } from '../../../../Modules/Moderation/Services/Moderation';
import { GuildSettingsCache } from '../../../Cache';
import { Cache } from '../../../Decorators/Cache';
import { Service } from '../../../Decorators/Service';
import { responseFunc, ShardCommand, ShardCommandType, ShardMessage } from './ShardCommand';

export default class extends ShardCommand {
	@Cache() guilds: GuildSettingsCache;
	@Service() moder: ModerationService;

	public cmd = ShardCommandType.GUILD_INFO;

	public async execute({ guildId, extended }: ShardMessage, sendResponse: responseFunc) {
		let guild: any = this.client.guilds.get(guildId);

		if (!guild) {
			guild = await this.client.getRESTGuild(guildId).catch(() => null);
		}

		guild = extended ? await this.getGuildDto(guild) : { bot: !!guild };

		return sendResponse({
			guild
		});
	}

	private async getGuildDto(guild: Guild) {
		if (guild === null) {
			return null;
		}

		let me = guild.members.get(this.client.user.id);

		if (!me) {
			me = await guild.getRESTMember(this.client.user.id);
		}

		const roles = JSON.parse(JSON.stringify([...guild.roles.values()]));
		const editableRoles = this.moder.editableRoles(
			guild,
			roles.map((r: Role) => r.id),
			me
		);

		return {
			id: guild.id,
			name: guild.name,
			iconURL: guild.dynamicIconURL('png', 4096),
			roles: roles.map((r: any) =>
				Object.assign(r, {
					access: editableRoles.some((role) => role.id === r.id)
				})
			),
			channels: [...guild.channels.values()],
			emojis: [...guild.emojis.values()]
		};
	}
}
