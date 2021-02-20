import { container, InjectionToken } from 'tsyringe';

interface IModuleOpts {
	services?: { [key: string]: InjectionToken<unknown> }
}
export class Module {
	public constructor({ services }: IModuleOpts = {}) {
		this.registerServices(services);
	}

	private registerCommands() {

	}

	private registerServices(services: { [x: string]: InjectionToken<unknown> } = {}): void {
		for (const service of Object.values(services)) {
			container.resolve(service);
		}
	}
}
