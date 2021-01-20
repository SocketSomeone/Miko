import { MiCache } from '@miko/cache';
import { MiClient, MiService } from '..';
import { Constructor } from '../types';

class MetadataStorage {
    public client!: MiClient;

    public readonly caches: Map<Constructor<MiCache>, MiCache> = new Map();

    public readonly services: Map<Constructor<MiService>, MiService> = new Map();
}

export const metaStorage: MetadataStorage = new MetadataStorage();