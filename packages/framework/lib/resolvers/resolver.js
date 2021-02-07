"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiResolver = void 0;
const logger_1 = require("@miko/logger");
class MiResolver {
    constructor() {
        this.logger = new logger_1.Logger(this.constructor.name);
    }
    init() {
        this.logger.log('Resolver is initialized!');
    }
}
exports.MiResolver = MiResolver;
//# sourceMappingURL=resolver.js.map