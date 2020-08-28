import { Command, Context } from '../commands/Command';

import { Resolver } from './Resolver';

export class CommandResolver extends Resolver {
	public async resolve(value: string, { guild, funcs: { t } }: Context): Promise<Command> {
		if (!guild || !value) {
			return;
		}

		const name = value.toLowerCase();
		const cmds = this.client.commands.commands.filter(
			(c) => (c.name.toLowerCase().includes(name) || c.aliases.indexOf(name) >= 0) && c.group !== null
		);

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
