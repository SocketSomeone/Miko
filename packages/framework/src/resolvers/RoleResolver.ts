import type { Guild, Role } from 'discord.js';
import { BaseResolver } from '../models';

const idRegex = /^(?:<@&)?(\d+)>?$/;

export class RoleResolver extends BaseResolver<Role> {
	private allowEveryone: boolean;

	public constructor(allowEveryone = false) {
		super();

		this.allowEveryone = allowEveryone;
	}

	public async resolve(value: string, guild: Guild): Promise<Role> {
		if (!guild || !value) {
			return;
		}

		let role: Role;

		if (idRegex.test(value)) {
			const id = value.match(idRegex)[1];
			role = guild.roles.resolve(id);

			if (!role || role.managed) {
				throw Error('Не удалось получить роль!');
			}
		} else {
			const name = value.toLowerCase();

			let roles = guild.roles.cache.filter(r => {
				const rName = r.name.toLowerCase();
				return rName === name;
			});

			if (roles.size === 0) {
				roles = guild.roles.cache.filter(r => {
					const rName = r.name.toLowerCase();
					return rName.includes(name) || name.includes(rName);
				});
			}

			if (roles.size === 1) {
				role = roles.first();
			} else {
				throw Error('Не удалось получить роль!');
			}
		}

		if (guild.id === role.id && this.allowEveryone === false) {
			throw Error('Нельзя упомянуть данную роль!');
		}

		return role;
	}
}
