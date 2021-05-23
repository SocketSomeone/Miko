import { injectable } from 'tsyringe';
import { BaseQueueListner } from '@miko/framework';
import type { CommandsGetDTO } from '@miko/common';
import { AutoWired } from '@miko/common';
import { CommandHolderService } from '@miko/framework/lib/services/CommandHolderService';

@injectable()
export class CommandsGet extends BaseQueueListner<'COMMANDS_GET'> {
	@AutoWired()
	public commandsHolderService: CommandHolderService;

	public constructor() {
		super('COMMANDS_GET');
	}

	public async execute(): Promise<CommandsGetDTO> {
		return {
			groups: [...this.commandsHolderService.groups.values()],
			commands: [...this.commandsHolderService.values()]
		};
	}
}
