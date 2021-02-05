import { Logger } from '@miko/logger';

export abstract class MiResolver<V> {
    protected readonly logger = new Logger(this.constructor.name);

    public init(): void {
        this.logger.log('Resolver is initialized!');
    }

    public abstract resolver(value: string): Promise<V>;
}
