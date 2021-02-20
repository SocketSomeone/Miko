import { container, InjectionToken } from 'tsyringe';
import { MiCommand } from '../command';

type ObjectOfItems<T> = { [key: string]: T };

interface IModuleOpts {
	services: ObjectOfItems<InjectionToken<unknown>>;
	commands: ObjectOfItems<MiCommand>;
}
export class Module {
	public constructor(
		{ services, commands }: IModuleOpts = {
			services: {},
			commands: {}
		}
	) {
		for (const service of Object.values(services)) {
			container.resolve(service);
		}
	}
}
