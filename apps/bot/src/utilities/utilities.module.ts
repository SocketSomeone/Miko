import { Module } from '@nestjs/common';
import { UtilitiesCommands } from './utilities.commands';

@Module({
	providers: [UtilitiesCommands],
	exports: [UtilitiesCommands]
})
export class UtilitiesModule {}
