import { Logger } from '@miko/logger';
export declare abstract class MiResolver<V> {
    protected readonly logger: Logger;
    init(): void;
    abstract resolver(value: string): Promise<V>;
}
//# sourceMappingURL=resolver.d.ts.map