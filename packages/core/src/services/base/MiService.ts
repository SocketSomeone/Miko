import { CacheManager } from '@miko/cache';
import { DeepPartial, getCustomRepository, GuildEntity, GuildRepository, ObjectType } from '@miko/database';
import { Constructor } from '@miko/utils';
import { AutoWired } from '../../decorators';
import { GatewayService } from '../GatewayService';

export abstract class MiService<T extends GuildEntity, R extends GuildRepository<T>> {
	@AutoWired()
	protected readonly cacheManager: CacheManager;

	@AutoWired()
	protected readonly gatewayService: GatewayService;

	protected readonly repository: R;

	protected readonly entity: Constructor<T>;

	protected constructor(entity: Constructor<T>, repository: ObjectType<R>) {
		this.entity = entity;
		this.repository = getCustomRepository(repository, process.env.NODE_ENV);
	}

	public async get(id: string): Promise<T> {
		return this.repository.findOne(id);
	}

	public async getByGuildId(guildId: string): Promise<T> {
		return this.cacheManager.get(this.entity, guildId, this.repository.findByGuildId);
	}

	public async save(entity: DeepPartial<T>): Promise<T> {
		const result = await this.repository.save(entity);

		this.delete(result.guildId);

		return result;
	}

	public async exists(guildId: string): Promise<boolean> {
		return this.repository.existsByGuildId(guildId);
	}

	public delete(guildId: string): void {
		this.gatewayService.deleteCache(this.entity, guildId);

		this.cacheManager.delete(this.entity, guildId);
	}

	public async getOrCreate(guildId: string): Promise<T> {
		let result = await this.getByGuildId(guildId);

		if (result === null) {
			result = await this.save(this.createNew(guildId));
		}

		return result;
	}

	protected abstract createNew(guildId: string): DeepPartial<T>;
}
