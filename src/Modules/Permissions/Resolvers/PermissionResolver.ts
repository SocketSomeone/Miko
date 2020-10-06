import { PermissionsTarget, Target } from '../../../Misc/Models/Permisson';
import { Resolver, CommandResolver, EnumResolver } from '../../../Framework/Resolvers';
import { Context } from '../../../Framework/Commands/Command';
import { BaseModule } from '../../../Framework/Module';
import { ModuleResolver } from '../../../Framework/Resolvers/ModuleResolver';

const all = new Set(['all', 'все', 'всё']);

export class PermissionTargetResolver extends Resolver {
	private commmandResolver: CommandResolver;
	private moduleResolver: ModuleResolver;

	public constructor(module: BaseModule) {
		super(module);

		this.commmandResolver = new CommandResolver(module);
		this.moduleResolver = new ModuleResolver(module);
	}

	public async resolve(value: string, ctx: Context): Promise<PermissionsTarget> {
		if (!value) {
			return;
		}

		const text = value.toLowerCase();

		if (all.has(text)) {
			return {
				id: '*',
				type: Target.AllModules
			};
		}

		const module: BaseModule = await this.moduleResolver.resolve(value, ctx).catch(() => undefined);

		if (module) {
			return {
				type: Target.Module,
				id: module.names.en
			};
		}

		const command = await this.commmandResolver.resolve(value, ctx);

		return {
			type: Target.Command,
			id: command.name
		};
	}
}
