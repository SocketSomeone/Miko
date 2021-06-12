import { Command, CommandContext, CommandService } from '@miko/framework';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ModerationCommands {
	public constructor(private commandService: CommandService) {}

	@Command('ping')
	public async ping(context: CommandContext): Promise<void> {
	}
}
