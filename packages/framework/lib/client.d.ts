import { Client } from 'discord.js';
import { Logger } from '@miko/logger';
import { IMikoMetrics } from './types';
import { ModuleBuilder } from './utils/moduleBuilder';
export declare class MiClient extends Client {
    protected readonly logger: Logger;
    metrics: IMikoMetrics;
    constructor(...modules: ModuleBuilder[]);
    login(token?: string): Promise<string>;
    private onClientReady;
    private onShardReady;
    private onShardReconnecting;
    private onShardResume;
    private onShardDisconnect;
    private onWarn;
    private onError;
    private onRatelimit;
    private onGuildUnavailable;
}
//# sourceMappingURL=client.d.ts.map