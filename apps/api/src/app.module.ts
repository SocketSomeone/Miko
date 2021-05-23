import { HttpModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CommandsModule } from './commands/commands.module';
import { DISCORD_URL } from './common/constants';
import { DiscordAuth } from './common/guards';
import { DiscordService } from './common/services/discord.service';
import { ContributorsModule } from './contributors/contributors.module';

@Module({
	imports: [
		HttpModule.register({
			baseURL: DISCORD_URL,
			timeout: 5000,
			maxRedirects: 5
		}),
		ContributorsModule,
		CommandsModule
	],
	providers: [
		DiscordService,
		{
			provide: APP_GUARD,
			useClass: DiscordAuth
		}
	]
})
export class AppModule {}
