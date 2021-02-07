"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const metaStorage_1 = require("../utils/metaStorage");
function Cache(explicitCache) {
    return (target, key) => {
        const implicitCache = Reflect.getMetadata('design:type', target, key);
        if (!implicitCache && !explicitCache) {
            throw new Error(`${target.constructor.name}:${key.toString()} needs to have defined type`);
        }
        const CacheClass = explicitCache || implicitCache;
        if (!metaStorage_1.metaStorage.caches.has(CacheClass)) {
            metaStorage_1.metaStorage.caches.set(CacheClass, new CacheClass());
        }
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() { return metaStorage_1.metaStorage.caches.get(CacheClass); }
        });
    };
}
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map