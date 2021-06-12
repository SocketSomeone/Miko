import type { DeepPartial } from 'typeorm';
import type { Constructor } from '../../interfaces';
import type { BaseGuildEntity } from '../../database/models';
import type { BaseGuildRepository } from '../../database/repositories/base';
import type { CacheManager } from '../cache-manager.service';

// Domain Service
export abstract class DomainService<T extends BaseGuildEntity, R extends BaseGuildRepository<T>> {
	protected abstract readonly cacheManager: CacheManager;

	protected abstract readonly repository: R;

	protected readonly entity: Constructor<T>;

	protected constructor(entity: Constructor<T>) {
		this.entity = entity;
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
		// this.gateway.emit('CACHE_DELETE', {
		// cacheName: this.entity.name,
		// guildId
		// });

		this.cacheManager.delete(this.entity, guildId);
	}

	public async getOrCreate(guildId: string): Promise<T> {
		let result = await this.getByGuildId(guildId);

		if (result === null || result === undefined) {
			result = await this.save(this.createNew(guildId));
		}

		return result;
	}

	protected abstract createNew(guildId: string): DeepPartial<T>;
}
