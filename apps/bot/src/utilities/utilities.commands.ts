import { Command, CommandContext, CommandService } from '@miko/framework';
import { Injectable } from '@nestjs/common';
import moment from 'moment';

@Injectable()
export class UtilitiesCommands {
	public constructor(private commandService: CommandService) {}

	@Command('ping')
	public async ping(context: CommandContext): Promise<void> {}
}
