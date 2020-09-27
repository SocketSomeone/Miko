import { Context as CommandContext } from '../Commands/Command';
import { FrameworkModule } from '../FrameworkModule';
import { BaseModule } from '../Module';
import { Resolver as BaseResolver } from './Resolver';

export class ModuleResolver extends BaseResolver {
	private modules: Map<string, BaseModule>;

	public constructor(module: BaseModule) {
		super(module);

		this.modules = new Map();

		for (const m of module.client.modules.values()) {
			this.modules.set(module.name, module);
		}
	}

	public async resolve(value: string, { guild, funcs: { t } }: CommandContext): Promise<BaseModule> {
		if (!value || !guild) {
			return;
		}

		const module = this.modules.get(value.toLowerCase());
		// The framework itself does not count as a module
		if (module instanceof FrameworkModule) {
			return;
		}

		if (!module) {
			throw new Error(t('resolvers.module.notFound'));
		}

		return module;
	}
}
