import { CacheManager } from '@miko/cache';
import type { DeepPartial, GuildEntity, GuildRepository, ObjectType } from '@miko/database';
import { getCustomRepository } from '@miko/database';
import type { Constructor } from '@miko/utils';
import { AutoWired } from '@miko/utils';
import { GatewaySender } from '../gateway';

export abstract class BaseService<T extends GuildEntity, R extends GuildRepository<T>> {
	@AutoWired()
	protected readonly cacheManager: CacheManager;

	@AutoWired()
	protected readonly gatewayService: GatewaySender;

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
		const supplier = this.repository.findByGuildId.bind(this.repository);

		return this.cacheManager.get(this.entity, guildId, supplier);
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
		this.gatewayService.deleteCache({
			cacheName: this.entity.name,
			guildId
		});

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
