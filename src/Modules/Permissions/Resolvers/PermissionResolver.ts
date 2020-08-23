import { PermissionsTarget, PermissionsExecute } from '../../../Misc/Models/Permisson';
import { Resolver, CommandResolver, EnumResolver } from '../../../Framework/Resolvers';
import { Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';

const all = new Set(['all', 'все', 'всё']);

export class PermissionTargetResolver extends Resolver {
	private commmandResolver: CommandResolver;
	private enumResolver: EnumResolver;

	public constructor(client: BaseClient) {
		super(client);

		this.commmandResolver = new CommandResolver(this.client);
		this.enumResolver = new EnumResolver(client, Object.keys(CommandGroup));
	}

	public async resolve(value: string, ctx: Context): Promise<PermissionsTarget> {
		if (!value) {
			return;
		}

		const text = value.toLocaleLowerCase();

		if (all.has(text)) {
			return {
				id: '*',
				type: PermissionsExecute.AllModules
			};
		}

		const module = await this.enumResolver.resolve(value, ctx).catch(() => undefined);

		if (module) {
			return {
				type: PermissionsExecute.Module,
				id: module
			};
		}

		const command = await this.commmandResolver.resolve(value, ctx);

		return {
			type: PermissionsExecute.Command,
			id: command.name
		};
	}
}
