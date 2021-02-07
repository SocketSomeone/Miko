"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const metadata_1 = require("../metadata");
function Cache(explicitCache) {
    return (target, key) => {
        const implicitCache = Reflect.getMetadata('design:type', target, key);
        if (!implicitCache && !explicitCache) {
            throw new Error(`${target.constructor.name}:${key.toString()} needs to have defined type`);
        }
        const CacheClass = explicitCache || implicitCache;
        if (!metadata_1.metaStorage.caches.has(CacheClass)) {
            metadata_1.metaStorage.caches.set(CacheClass, new CacheClass());
        }
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() { return metadata_1.metaStorage.caches.get(CacheClass); }
        });
    };
}
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map