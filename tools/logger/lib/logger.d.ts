export interface ILogger {
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug?(message: any, context?: string): void;
    verbose?(message: any, context?: string): void;
}
export declare class Logger implements ILogger {
    protected static instance?: typeof Logger;
    private context;
    constructor(context?: string);
    error(message: any, context?: string): void;
    log(message: any, context?: string): void;
    warn(message: any, context?: string): void;
    debug(message: any, context?: string): void;
    verbose(message: any, context?: string): void;
    static log(message: any, context?: string): void;
    static error(message: any, context?: string): void;
    static warn(message: any, context?: string): void;
    static debug(message: any, context?: string): void;
    static verbose(message: any, context?: string): void;
    static getTimestamp(): string;
    private callFunction;
    private static printMessage;
    private static printStackTrace;
}
//# sourceMappingURL=logger.d.ts.map