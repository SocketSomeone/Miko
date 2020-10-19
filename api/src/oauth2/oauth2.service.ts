import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { codeDto } from './dto/codeDto';

@Injectable()
export class OAuth2Service {
  constructor(private http: HttpService, private config: ConfigService) {}

  private clientID = this.config.get('CLIENT_ID');
  private clientSecret = this.config.get('CLIENT_SECRET');

  async accessCode({ redirectUri, code }: codeDto) {
    const params = new URLSearchParams({
      client_id: this.clientID,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      scope: 'identify guilds',
    });

    const { data } = await this.http
      .post('oauth2/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .toPromise();

    return data;
  }
}
