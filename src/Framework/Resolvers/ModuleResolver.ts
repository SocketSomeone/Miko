import { Context as CommandContext } from '../Commands/Command';
import { FrameworkModule } from '../FrameworkModule';
import { BaseModule } from '../Module';
import { Resolver as BaseResolver } from './Resolver';

export class ModuleResolver extends BaseResolver {
	private modules: Map<string, BaseModule> = new Map();

	public constructor(module: BaseModule) {
		super(module);

		for (const m of module.client.modules.values()) {
			for (const name of Object.values(m.names)) {
				this.modules.set(name.toLowerCase(), m);
			}
		}
	}

	public async resolve(value: string, { guild, funcs: { t } }: CommandContext): Promise<BaseModule> {
		if (!value || !guild) {
			return;
		}

		const module = this.modules.get(value.toLowerCase());

		if (module instanceof FrameworkModule || !module) {
			throw new Error(t('resolvers.module.notFound'));
		}

		return module;
	}
}
