import { Module } from '@nestjs/common';
import { CommandsModule } from './commands/commands.module';
import { ContributorsModule } from './contributors/contributors.module';
import { CoreModule } from './core.module';
import { GuildsModule } from './guilds/guilds.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
	imports: [CoreModule, ContributorsModule, CommandsModule, GuildsModule, MetricsModule]
})
export class AppModule {}
