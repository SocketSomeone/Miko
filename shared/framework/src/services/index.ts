import { Logger } from '@miko/logger';
import { Client, MiClient } from '..';

export abstract class MiService {
    @Client()
    protected readonly client!: MiClient;

    protected readonly logger = new Logger(this.constructor.name);

    public async init(): Promise<void> {
        this.logger.log('Service is initialized!');
    }
}