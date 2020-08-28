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
				member = await guild.getRESTMember(id).catch(() => undefined);
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
				throw Error(t(`resolvers.member.notFound`));
			}
		}

		if (member.id === this.client.user.id) {
			throw Error(t(`resolvers.member.bot`));
		}

		return member;
	}
}
