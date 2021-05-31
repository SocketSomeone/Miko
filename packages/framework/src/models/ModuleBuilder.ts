import { AutoWired, arrarify } from '@miko/common';
import type { AllowArray, Constructor } from '@miko/common';

import { container } from 'tsyringe';
import { CommandHolderService } from '../services/CommandHolderService';
import type { BaseCommand } from './BaseCommand';

export class ModuleBuilder {
	@AutoWired()
	public static commandHolderService: CommandHolderService;

	public static build(opts: {
		commands: AllowArray<Constructor<BaseCommand>>;
		services: AllowArray<Constructor<unknown>>;
	}): void {
		const commands = arrarify(opts.commands);

		const services = arrarify(opts.services);

		commands.forEach(Command => this.commandHolderService.register(new Command()));

		services.forEach(service => container.resolve(service));
	}
}
