import { Logger } from '@miko/logger';
import { MiModule, MiClient } from '..';

export abstract class MiService {
    protected module: MiModule;

    protected client: MiClient;

    protected logger = new Logger(this.constructor.name);

    public constructor(module: MiModule) {
        this.module = module;
        this.client = module.client;
    }

    public async init(): Promise<void> {
        this.logger.log('Service is initialized!');
    }

    public async onClientReady(): Promise<void> {
        this.client.provider.serviceStartupDone(this);
    }
}