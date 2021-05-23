import { Controller, Get } from '@nestjs/common';

@Controller('/guilds')
export class GuildsController {
	@Get()
	public getCurrentGuilds(): unknown[] {
		return [];
	}
}
