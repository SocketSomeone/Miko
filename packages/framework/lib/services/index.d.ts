import { Logger } from '@miko/logger';
import { MiClient } from '..';
export declare abstract class MiService {
    protected readonly client: MiClient;
    protected readonly logger: Logger;
    init(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map