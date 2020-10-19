import { Body, Controller, Post, Query } from '@nestjs/common';
import { codeDto } from './dto/codeDto';
import { OAuth2Service } from './oauth2.service';

@Controller('/api/oauth2')
export class OAuth2Controller {
  constructor(private oauth: OAuth2Service) {}

  @Post('token')
  async getToken(@Body() codeDto: codeDto) {
    return await this.oauth.accessCode(codeDto);
  }
}
