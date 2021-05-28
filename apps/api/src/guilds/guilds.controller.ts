import { Controller, Get } from '@nestjs/common';
import { Token } from '../common/decorators';
import type { GuildDTO } from './dto/guildDTO';
import { GuildsService } from './guilds.service';

@Controller('/guilds')
export class GuildsController {
	public constructor(private guildsService: GuildsService) {}

	@Get()
	public getCurrentGuilds(@Token() token: string): Promise<GuildDTO[]> {
		return this.guildsService.getCurrentGuilds(token);
	}
}
