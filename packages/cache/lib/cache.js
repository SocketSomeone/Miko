"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiCache = void 0;
const logger_1 = require("@miko/logger");
const moment_1 = __importStar(require("moment"));
const metrics_1 = require("./metrics");
class MiCache {
    constructor({ maxSize = 50, expireAfter = moment_1.duration(6, 'hours'), refreshAfter = undefined, checkInterval = 1000 } = {}) {
        this.logger = new logger_1.Logger(this.constructor.name);
        this.storage = new Map();
        this.pending = new Map();
        this.metrics = new metrics_1.CacheMetrics();
        this.maxSize = maxSize;
        this.expireAfter = expireAfter;
        this.refreshAfter = refreshAfter;
        if (checkInterval) {
            setInterval(this.checkCache.bind(this), checkInterval);
        }
    }
    async init() {
        this.logger.log('Cache initialized..');
    }
    async set(key, value, ttl = this.expireAfter, ref = this.refreshAfter) {
        if (this.maxSize && this.storage.size >= this.maxSize) {
            this.metrics.evictions += 1;
            let olderTime;
            let olderKey;
            for (const [iterKey, iterVal] of this.storage) {
                if (!olderKey) {
                    olderKey = iterKey;
                    olderTime = iterVal.addedAt;
                    continue;
                }
                if (!iterVal.addedAt
                    || (olderTime
                        && olderTime.isBefore(iterVal.addedAt)))
                    continue;
                olderKey = iterKey;
                olderTime = iterVal.addedAt;
            }
            if (typeof olderKey === 'string') {
                this.delete(olderKey);
            }
        }
        this.storage.set(key, {
            data: value,
            addedAt: moment_1.default(),
            expires: ttl ? moment_1.default().add(ttl) : null,
            refresh: ref ? moment_1.default().add(ref) : null
        });
    }
    async get(key) {
        const entry = this.storage.get(key);
        if (entry) {
            const curTime = moment_1.default();
            this.metrics.hits += 1;
            if ((entry.refresh && curTime.isAfter(entry.refresh)) || (entry.expires && curTime.isAfter(entry.expires))) {
                return this.tryLoad(key);
            }
            return entry.data;
        }
        return this.tryLoad(key);
    }
    async delete(key) {
        return this.storage.delete(key);
    }
    async clear() {
        return this.storage.clear();
    }
    async tryLoad(key) {
        try {
            const res = this.pending.get(key);
            if (res) {
                return res;
            }
            const promise = this.load(key)
                .finally(() => this.pending.delete(key));
            this.pending.set(key, promise);
            const obj = await promise;
            this.set(key, obj);
            this.metrics.loadSuccess += 1;
            return obj;
        }
        catch (err) {
            this.metrics.loadError += 1;
            this.metrics.misses += 1;
            return undefined;
        }
    }
    checkCache() {
        const curTime = moment_1.default();
        for (const [key, entry] of this.storage) {
            if (entry.refresh && curTime.isBefore(entry.refresh)) {
                this.tryLoad(key);
            }
            if (entry.expires && curTime.isBefore(entry.expires)) {
                this.delete(key);
            }
        }
    }
}
exports.MiCache = MiCache;
//# sourceMappingURL=cache.js.map