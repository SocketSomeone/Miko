import type { Guild, GuildMember } from 'discord.js';
import { BaseResolver } from '../models';

const idRegex = /^(?:<@!?)?(\d+)>?$/;

export class MemberResolver extends BaseResolver<GuildMember> {
	public async resolve(value: string, guild: Guild): Promise<GuildMember> {
		if (!value || !guild) {
			return;
		}

		let member: GuildMember;

		if (idRegex.test(value)) {
			const id = value.match(idRegex)[1];
			member = guild.members.resolve(id);

			if (!member) {
				member = await guild.members.fetch(id).catch(() => undefined);
			}

			if (!member) {
				throw Error('Не удалось найти пользователя');
			}
		} else {
			const name = value.toLowerCase();

			const members = guild.members.cache.filter(m => {
				const mName = `${m.user.username.toLowerCase()}#${m.user.discriminator}`;
				return mName.includes(name) || name.includes(mName);
			});

			if (members.size === 1) {
				member = members.first();
			} else {
				throw Error('Не удалось найти пользователя');
			}
		}

		if (member.id === guild.client.user.id || member.user.bot) {
			throw Error('С ботом нельзя взаимодейтсовать!');
		}

		return member;
	}
}
