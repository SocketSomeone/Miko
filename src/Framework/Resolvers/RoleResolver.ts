import { Role } from 'eris';

import { Context } from '../commands/Command';

import { Resolver } from './Resolver';
import { BaseClient } from '../../Client';

const idRegex = /^(?:<@&)?(\d+)>?$/;

export class RoleResolver extends Resolver {
	private allowEveryone: boolean;

	public constructor(client: BaseClient, allowEveryone: boolean = false) {
		super(client);

		this.allowEveryone = allowEveryone;
	}

	public async resolve(value: string, { guild, funcs: { t } }: Context): Promise<Role> {
		if (!guild || !value) {
			return;
		}

		let role: Role;
		if (idRegex.test(value)) {
			const id = value.match(idRegex)[1];
			role = guild.roles.get(id);
			if (!role || role.managed) {
				throw Error(t(`resolvers.role.notFound`));
			}
		} else {
			const name = value.toLowerCase();

			// Trying to find exact match
			let roles = guild.roles.filter((r) => {
				const rName = r.name.toLowerCase();
				return rName === name;
			});

			// If no roles found, allow for partial match
			if (roles.length === 0) {
				roles = guild.roles.filter((r) => {
					const rName = r.name.toLowerCase();
					return rName.includes(name) || name.includes(rName);
				});
			}

			if (roles.length === 1) {
				role = roles[0];
			} else {
				throw Error(t(`resolvers.command.notFound`));
			}
		}

		if (guild.id === role.id && this.allowEveryone === false) {
			throw Error(t(`resolvers.role.everyone`));
		}

		return role;
	}
}
