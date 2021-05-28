import { AutoWired, GatewayService } from '@miko/common';
import { Global, HttpModule, Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DISCORD_URL } from './common/constants';
import { DiscordAuth } from './common/guards';
import { DiscordService } from './common/services/discord.service';

@Global()
@Module({
	imports: [
		HttpModule.register({
			baseURL: DISCORD_URL,
			timeout: 5000,
			maxRedirects: 5
		})
	],
	exports: [HttpModule, DiscordService],
	providers: [
		DiscordService,
		{
			provide: APP_GUARD,
			useClass: DiscordAuth
		}
	]
})
export class CoreModule {}
