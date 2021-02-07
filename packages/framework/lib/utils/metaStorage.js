"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaStorage = void 0;
const logger_1 = require("@miko/logger");
class MetadataStorage {
    constructor() {
        this.logger = new logger_1.Logger('META');
        this.caches = new Map();
        this.services = new Map();
    }
    addModules(client, modules) {
        this.client = client;
        this.logger.log(modules);
    }
    async init() {
        return Promise.all(this.allServices.map(x => x.init()));
    }
    get allServices() {
        return [
            ...this.caches.values(),
            ...this.services.values()
        ];
    }
}
exports.metaStorage = new MetadataStorage();
//# sourceMappingURL=metaStorage.js.map