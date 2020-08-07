import { Member } from 'eris';

import { Context } from '../commands/Command';

import { Resolver } from './Resolver';

const idRegex = /^(?:<@!?)?(\d+)>?$/;

export class MemberResolver extends Resolver {
	public async resolve(value: string, { guild, funcs: { t } }: Context): Promise<Member> {
		if (!value || !guild) {
			return;
		}

		let member: Member;

		if (idRegex.test(value)) {
			const id = value.match(idRegex)[1];
			member = guild.members.get(id);

			if (!member) {
				member = await guild.getRESTMember(id).then(() => undefined);
			}

			if (!member) {
				throw Error(t(`resolvers.member.notFound`));
			}
		} else {
			const name = value.toLowerCase();

			const members = guild.members.filter((m) => {
				const mName = m.username.toLowerCase() + '#' + m.discriminator;
				return mName.includes(name) || name.includes(mName);
			});

			if (members.length === 1) {
				member = members[0];
			} else {
				if (members.length === 0) {
					throw Error(t(`resolvers.member.notFound`));
				} else {
					throw Error(
						t(`resolvers.member.multiple`, {
							members: members
								.slice(0, 10)
								.map((m) => `\`${m.username}#${m.discriminator}\``)
								.join(', ')
						})
					);
				}
			}
		}

		if (member.id === this.client.user.id) {
			throw Error(t(`resolvers.member.bot`));
		}

		return member;
	}
}
