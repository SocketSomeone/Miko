import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuth2Module } from './oauth2/oauth2.module';
import { GuildModule } from './guild/guild.module';

@Module({
  imports: [
    OAuth2Module,
    GuildModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
