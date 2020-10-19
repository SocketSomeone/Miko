import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpConfigService } from 'src/utils/http.service';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  controllers: [GuildController],
  providers: [GuildService],
})
export class GuildModule {}
