import { Logger } from 'tslog';
import { injectable } from 'tsyringe';
import type { BaseCommand } from '../models';

@injectable()
export class CommandHolderService extends Map<string, BaseCommand> {
	private logger = new Logger({ name: this.constructor.name });

	public groups: Set<string> = new Set();

	public register(command: BaseCommand): void {
		const conflict = this.get(command.name.toLowerCase());

		if (conflict) {
			this.logger.error(`Command ${command.name} already exists!`);
			process.exit(1);
		}

		this.set(command.name.toLowerCase(), command);
		this.groups.add(command.group);
		this.logger.debug('Added new command');
	}

	public getCommands(): BaseCommand[] {
		return [...this.values()];
	}
}
