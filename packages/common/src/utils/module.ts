import { Constructor, ObjectOfItems } from '@miko/utils';
import { container, InjectionToken } from 'tsyringe';
import { CommandService, MiCommand } from '../commands';

interface IModuleOpts {
	services?: ObjectOfItems<InjectionToken<unknown>>;
	commands?: ObjectOfItems<Constructor<MiCommand>>;
}
export class Module {
	private commandService = container.resolve(CommandService);

	public constructor({ services = {}, commands = {} }: IModuleOpts) {
		for (const service of Object.values(services)) {
			container.resolve(service);
		}

		for (const Command of Object.values(commands)) {
			this.commandService.register(new Command());
		}
	}
}
