import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
import { ContributorsModule } from './contributors/contributors.module';
import { CoreModule } from './core.module';
import { GuildsModule } from './guilds/guilds.module';

@Module({
	imports: [CoreModule, ContributorsModule, CommandsModule, GuildsModule]
})
export class AppModule {}
