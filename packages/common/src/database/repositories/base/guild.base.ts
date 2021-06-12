import { Repository } from 'typeorm';
import type { BaseGuildEntity } from '../../models';

export abstract class BaseGuildRepository<T extends BaseGuildEntity> extends Repository<T> {
	public findByGuildId(guildId: string): Promise<T> {
		return this.findOne({
			where: {
				guildId
			}
		});
	}

	public findAllByGuildId(guildId: string): Promise<T[]> {
		return this.find({
			where: {
				guildId
			}
		});
	}

	public async existsByGuildId(guildId: string): Promise<boolean> {
		const countOfGuilds = await this.count({
			where: {
				guildId
			}
		});

		return countOfGuilds > 0;
	}
}
