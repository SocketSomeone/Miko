import { Logger } from '@miko/logger';
import { Client, MiClient } from '..';

export abstract class MiService {
    @Client()
    protected client!: MiClient;

    protected logger = new Logger(this.constructor.name);

    public constructor() {
        this.logger.log('Service is initialized!');
    }
}