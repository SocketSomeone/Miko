"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const colors_1 = require("./colors");
class Logger {
    constructor(context = '') {
        this.context = context;
    }
    error(message, context) {
        Logger.error.call(Logger, message, context || this.context);
    }
    log(message, context) {
        this.callFunction('log', message, context);
    }
    warn(message, context) {
        this.callFunction('warn', message, context);
    }
    debug(message, context) {
        this.callFunction('debug', message, context);
    }
    verbose(message, context) {
        this.callFunction('verbose', message, context);
    }
    static log(message, context = '') {
        this.printMessage(message, colors_1.clc.green, context);
    }
    static error(message, context = '') {
        this.printMessage(message, colors_1.clc.red, context, 'stderr');
        this.printStackTrace(message);
    }
    static warn(message, context = '') {
        this.printMessage(message, colors_1.clc.yellow, context);
    }
    static debug(message, context = '') {
        this.printMessage(message, colors_1.clc.magentaBright, context);
    }
    static verbose(message, context = '') {
        this.printMessage(message, colors_1.clc.cyanBright, context);
    }
    static getTimestamp() {
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
    callFunction(name, message, context) {
        const instance = Logger;
        const func = instance[name];
        func.call(instance, message, context || this.context);
    }
    static printMessage(message, color, context = '', writeStreamType) {
        const output = typeof message === 'object' && !(message instanceof Error)
            ? `${color('Object:')}\n${JSON.stringify(message, null, 2)}\n`
            : color(message);
        const pidMessage = color(`[MIKO] ${process.pid}   - `);
        const contextMessage = context ? colors_1.clc.yellow(`[${context}] `) : '';
        const instance = this.instance || Logger;
        const computedMessage = `${pidMessage}${instance.getTimestamp()}   ${contextMessage}${output}\n`;
        process[writeStreamType || 'stdout'].write(computedMessage);
    }
    static printStackTrace(trace) {
        if (!trace) {
            return;
        }
        // eslint-disable-next-line no-console
        console.error(trace);
    }
}
exports.Logger = Logger;
Logger.instance = Logger;
//# sourceMappingURL=logger.js.map