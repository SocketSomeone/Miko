/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { clc } from './colors';

export interface ILogger {
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug?(message: any, context?: string): void;
    verbose?(message: any, context?: string): void;
}

export class Logger implements ILogger {
    private static lastTimestamp?: number;

    protected static instance?: typeof Logger = Logger;

    private context: string;

    constructor(context = '') {
        this.context = context;
    }

    error(message: any, context?: string): void {
        Logger.error.call(Logger, message, context || this.context);
    }

    log(message: any, context?: string): void {
        this.callFunction('log', message, context);
    }

    warn(message: any, context?: string): void {
        this.callFunction('warn', message, context);
    }

    debug(message: any, context?: string): void {
        this.callFunction('debug', message, context);
    }

    verbose(message: any, context?: string): void {
        this.callFunction('verbose', message, context);
    }

    static log(message: any, context = ''): void {
        this.printMessage(message, clc.green, context);
    }

    static error(
        message: any,
        context = ''
    ): void {
        this.printMessage(message, clc.red, context, 'stderr');
    }

    static warn(message: any, context = ''): void {
        this.printMessage(message, clc.yellow, context);
    }

    static debug(message: any, context = ''): void {
        this.printMessage(message, clc.magentaBright, context);
    }

    static verbose(message: any, context = ''): void {
        this.printMessage(message, clc.cyanBright, context);
    }

    static getTimestamp(): string {
        const localeStringOptions = {
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            day: '2-digit',
            month: '2-digit'
        };
        return new Date(Date.now()).toLocaleString(undefined, localeStringOptions);
    }

    private callFunction(
        name: 'log' | 'warn' | 'debug' | 'verbose',
        message: string,
        context?: string
    ) {
        const instance = Logger;
        const func = instance[name];

        func.call(
            instance,
            message,
            context || this.context
        );
    }

    private static printMessage(
        message: any,
        color: (text: string) => string,
        context = '',
        writeStreamType?: 'stdout' | 'stderr'
    ) {
        const output = typeof message === 'object' && !(message instanceof Error)
            ? `${color('Object:')}\n${JSON.stringify(message, null, 2)}\n`
            : color(message);

        const pidMessage = color(`[MIKO] ${process.pid}   - `);
        const contextMessage = context ? clc.yellow(`[${context}] `) : '';
        const instance = (this.instance as typeof Logger) || Logger;
        const computedMessage = `${pidMessage}${instance.getTimestamp()}   ${contextMessage}${output}\n`;

        process[writeStreamType || 'stdout'].write(computedMessage);
    }
}