import { MiCache } from '@miko/cache';
import { Logger } from '@miko/logger';
import { MiClient, MiService } from '..';
import { Constructor } from '../types';
import { ModuleBuilder } from '../utils/moduleBuilder';
declare class MetadataStorage {
    protected readonly logger: Logger;
    client: MiClient;
    readonly caches: Map<Constructor<MiCache>, MiCache>;
    readonly services: Map<Constructor<MiService>, MiService>;
    addModules(client: MiClient, modules: Array<ModuleBuilder>): void;
    init(): Promise<void[]>;
    private get allServices();
}
export declare const metaStorage: MetadataStorage;
export {};
//# sourceMappingURL=index.d.ts.map