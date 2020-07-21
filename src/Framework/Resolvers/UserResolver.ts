import { Context } from '../commands/Command';

import { Resolver } from './Resolver';
import { Member } from '../../Entity/Member';

const idRegex = /^(?:<@!?)?(\d+)>?$/;

interface BasicUser {
	id: string;
	createdAt: number;
	username: string;
	avatarURL: string;
	discriminator: string;
}

export class UserResolver extends Resolver {
	public async resolve(value: string, { guild, t }: Context): Promise<BasicUser> {
		if (!value) {
			return;
		}

		let user: BasicUser;

		if (idRegex.test(value)) {
			const id = value.match(idRegex)[1];

			user = this.client.users.get(id);

			if (!user) {
				user = await this.client.getRESTUser(id).then(() => undefined);
			}

			if (!user) {
				throw Error(t(`resolvers.user.notFound`));
			}
		} else {
			const fullName = value.toLowerCase();
			const [username, discriminator] = fullName.split('#');

			let users: BasicUser[] = this.client.users.filter(
				(u) => u.username.toLowerCase() === username && u.discriminator === discriminator
			);

			if (guild && users.length === 0) {
				users = guild.members
					.filter((m) => {
						const mName = m.username.toLowerCase() + '#' + m.discriminator;
						return mName.includes(fullName) || fullName.includes(mName);
					})
					.map((m) => m.user);
			}

			if (users.length === 0) {
				users = this.client.users.filter((u) => {
					const uName = u.username.toLowerCase() + '#' + u.discriminator;
					return uName.includes(fullName) || fullName.includes(uName);
				});
			}

			if (users.length === 1) {
				user = users[0];
			} else if (users.length === 0) {
				throw Error(t(`resolvers.user.notFound`));
			} else {
				throw Error(
					t(`resolvers.user.multiple`, {
						users: users
							.slice(0, 10)
							.map((u) => `\`${u.username}#${u.discriminator}\``)
							.join(', ')
					})
				);
			}
		}

		return user;
	}
}
