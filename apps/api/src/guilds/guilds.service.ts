// import { GatewayService } from '@miko/common';
import { Injectable } from '@nestjs/common';
import { DiscordService } from '../common/services/discord.service';
import type { GuildDTO } from './dto/guild.dto';

@Injectable()
export class GuildsService {
	public constructor(private discordService: DiscordService) {}

	public async getCurrentGuilds(token: string): Promise<GuildDTO[]> {
		return [];
		// const managedGuilds = await this.discordService.getManageableGuilds(token);

		// return Promise.all(
		// 	managedGuilds.map(async g => {
		// 		const guild = await this.gatewayService.emit('GUILD_INFO', {
		// 			guildId: g.id
		// 		});

		// 		return new GuildDTO({
		// 			id: g.id,
		// 			name: g.name,
		// 			icon: `${g.icon}${g.icon.startsWith('a_') ? '.gif' : '.png'}`,
		// 			added: !!guild && !!guild.id
		// 		});
		// 	})
		// );
	}
}
