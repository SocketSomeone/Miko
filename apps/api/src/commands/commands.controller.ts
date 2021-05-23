import type { CommandsGetDTO } from '@miko/common';
import { Controller, Get } from '@nestjs/common';
import { CommandsService } from './commands.service';

@Controller('/commands')
export class CommandsController {
	public constructor(private readonly commandsService: CommandsService) {}

	@Get()
	public async findAllCommands(): Promise<CommandsGetDTO> {
		return this.commandsService.findAll();
	}
}
