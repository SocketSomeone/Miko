import { AutoWired, GatewayService } from '@miko/common';
import { Injectable } from '@nestjs/common';
import { container } from 'tsyringe';
import { DiscordService } from '../common/services/discord.service';
import { GuildDTO } from './dto/guildDTO';

@Injectable()
export class GuildsService {
	public constructor(private discordSerivce: DiscordService) {}

	@AutoWired()
	public gatewayService: GatewayService;

	public async getCurrentGuilds(token: string): Promise<GuildDTO[]> {
		const managedGuilds = await this.discordSerivce.getManageableGuilds(token);

		return Promise.all(
			managedGuilds.map(async g => {
				const guild = await this.gatewayService.emit('GUILD_INFO', {
					guildId: g.id
				});

				return new GuildDTO({
					id: g.id,
					name: g.name,
					icon: `${g.icon}${g.icon.startsWith('a_') ? '.gif' : '.png'}`,
					added: !!guild && !!guild.id
				});
			})
		);
	}
}
