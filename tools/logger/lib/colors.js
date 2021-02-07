"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clc = void 0;
exports.clc = {
    green: (text) => `\x1B[32m${text}\x1B[39m`,
    yellow: (text) => `\x1B[33m${text}\x1B[39m`,
    red: (text) => `\x1B[31m${text}\x1B[39m`,
    cyanBright: (text) => `\x1B[96m${text}\x1B[39m`,
    magentaBright: (text) => `\x1B[95m${text}\x1B[39m`
};
//# sourceMappingURL=colors.js.map