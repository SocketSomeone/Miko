import { LoadingCache } from '@miko/cache';
import { HttpService, Injectable } from '@nestjs/common';
import { Permissions } from 'discord.js';
import moment from 'moment';
import type { IGuild, IUser } from '../models';

@Injectable()
export class DiscordService {
	public constructor(private http: HttpService) {}

	private guilds = new LoadingCache<IGuild[]>({
		maxSize: 10000,
		expireAfter: moment.duration(1, 'm'),
		load: async token => {
			const { data: guilds } = await this.http
				.get('users/@me/guilds', {
					headers: {
						Authorization: token
					}
				})
				.toPromise();

			return guilds;
		}
	});

	private authorities = new LoadingCache<IUser>({
		maxSize: 10000,
		expireAfter: moment.duration(1, 'm'),
		load: async token => {
			const { data: user } = await this.http
				.get('users/@me', {
					headers: {
						Authorization: token
					}
				})
				.toPromise();

			return user;
		}
	});

	public async getGuilds(token: string): Promise<IGuild[]> {
		return this.guilds.get(token);
	}

	public async getManageableGuilds(token: string): Promise<IGuild[]> {
		const guilds = await this.getGuilds(token);

		return guilds.filter(g => new Permissions(parseInt(g.permissions, 10)).has('ADMINISTRATOR') || g.owner);
	}

	public async getUserInfo(token: string): Promise<unknown> {
		return this.authorities.get(token);
	}
}
