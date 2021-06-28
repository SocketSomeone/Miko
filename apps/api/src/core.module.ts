import { Global, HttpModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
		}),
		ThrottlerModule.forRoot({
			ttl: 60,
			limit: 30
		})
	],
	exports: [HttpModule, DiscordService],
	providers: [
		DiscordService,
		{
			provide: APP_GUARD,
			useClass: DiscordAuth
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	]
})
export class CoreModule {}
