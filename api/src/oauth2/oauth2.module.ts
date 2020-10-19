import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpConfigService } from 'src/utils/http.service';
import { OAuth2Controller } from './oauth2.controller';
import { OAuth2Service } from './oauth2.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  controllers: [OAuth2Controller],
  providers: [OAuth2Service],
})
export class OAuth2Module {}
