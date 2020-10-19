import { Controller, Get, Headers } from '@nestjs/common';
import { GuildService } from './guild.service';

@Controller('/api/guilds')
export class GuildController {
  constructor(private guildService: GuildService) {}

  @Get('/')
  async getAllGuilds(@Headers('Authorization') token: string) {
    return await this.guildService.findAll(token);
  }
}
