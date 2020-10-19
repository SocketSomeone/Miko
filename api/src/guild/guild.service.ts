import { HttpService, Injectable } from '@nestjs/common';
import { IGuild } from './guild.interfaces';

@Injectable()
export class GuildService {
  constructor(private http: HttpService) {}

  async findAll(token: string) {
    const config = {
      headers: {
        Authorization: token,
      },
    };

    const { data: guilds } = await this.http
      .get('users/@me/guilds', config)
      .toPromise();

    // for (const x of guilds as IGuild[]) {
    //     const guild =
    // }

    return;
  }
}
