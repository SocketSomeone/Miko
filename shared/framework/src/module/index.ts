import { MiCache } from '@miko/cache';
import { Logger } from '@miko/logger';
import { AllowArray, Constructor } from '../types';
import { MiClient, MiCommand, MiService } from '..';

export abstract class MiModule {
    public client: MiClient;

    protected logger = new Logger(this.constructor.name);

    public constructor(client: MiClient) {
        this.client = client;
    }

    public async init(): Promise<void> {
        this.logger.log('Module is initialized!');
    }

    protected registerService<T extends MiService>(services: AllowArray<Constructor<T>>): void {
        return this.client.provider.registerService(this, services);
    }

    protected registerCommand<T extends MiCommand>(commands: AllowArray<Constructor<T>>): void {
        return this.client.provider.registerCommand(this, commands);
    }

    protected registerCache<T extends MiCache>(caches: AllowArray<Constructor<T>>): void {
        return this.client.provider.registerCache(caches);
    }
}