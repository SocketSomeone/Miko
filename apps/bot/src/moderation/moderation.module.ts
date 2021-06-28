import { Module } from '@nestjs/common';
import { ModerationCommands } from './moderation.commands';

@Module({
	providers: [ModerationCommands],
	exports: [ModerationCommands]
})
export class ModerationModule {}
