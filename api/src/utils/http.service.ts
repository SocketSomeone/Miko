import {
  HttpModuleOptions,
  HttpModuleOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  constructor(private config: ConfigService) {}

  createHttpOptions(): HttpModuleOptions {
    return {
      baseURL: this.config.get('API_URL'),
      timeout: 5000,
      maxRedirects: 5,
    };
  }
}
