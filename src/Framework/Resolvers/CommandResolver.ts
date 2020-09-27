import { BaseClient } from '../../Client';
import { BaseCommand, Context } from '../Commands/Command';
import { BaseModule } from '../Module';

import { Resolver } from './Resolver';

export class CommandResolver extends Resolver {
	private cmds: BaseCommand[] = [];

	public constructor(module: BaseModule) {
		super(module);

		this.cmds = [...this.client.commands.values()];
	}

	public async resolve(value: string, { guild, funcs: { t } }: Context): Promise<BaseCommand> {
		if (!guild || !value) {
			return;
		}

		const name = value.trim().toLowerCase();
		const cmds = this.cmds.filter((c) => c.name.toLowerCase().includes(name) || c.aliases.indexOf(name) >= 0);

		if (cmds.length === 0) {
			throw Error(t(`resolvers.command.notFound`));
		} else if (cmds.length === 1) {
			return cmds[0];
		} else {
			const cmd = cmds.find((c) => c.name.length - name.length === 0);

			if (!cmd) {
				throw Error(t(`resolvers.command.notFound`));
			}

			return cmd;
		}
	}
}
