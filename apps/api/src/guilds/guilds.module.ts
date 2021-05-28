import { HttpModule, Module } from '@nestjs/common';
import { DISCORD_URL } from '../common/constants';
import { DiscordService } from '../common/services/discord.service';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';

@Module({
	imports: [HttpModule.register({ baseURL: DISCORD_URL }), DiscordService],
	controllers: [GuildsController],
	providers: [GuildsService]
})
export class GuildsModule {}
