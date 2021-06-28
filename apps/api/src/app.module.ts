import { CommonModule } from '@miko/common';
import { Module } from '@nestjs/common';
import { CoreModule } from './core.module';
import { GuildsModule } from './guilds/guilds.module';

@Module({
	imports: [CommonModule, CoreModule, GuildsModule]
})
export class AppModule {}
