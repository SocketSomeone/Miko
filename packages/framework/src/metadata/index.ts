import { MiCache } from '@miko/cache';
import { Logger } from '@miko/logger';
import { MiClient, MiService } from '..';
import { Constructor } from '../types';
import { ModuleBuilder } from '../utils/moduleBuilder';

class MetadataStorage {
    protected readonly logger = new Logger('META');

    public client!: MiClient;

    public readonly caches: Map<Constructor<MiCache>, MiCache> = new Map();

    public readonly services: Map<Constructor<MiService>, MiService> = new Map();

    public addModules(client: MiClient, modules: Array<ModuleBuilder>): void {
        this.client = client;

        this.logger.log(modules);
    }

    public async init(): Promise<void[]> {
        return Promise.all(this.allServices.map(x => x.init()));
    }

    private get allServices(): Array<MiService | MiCache> {
        return [
            ...this.caches.values(),
            ...this.services.values()
        ];
    }
}

export const metaStorage: MetadataStorage = new MetadataStorage();
