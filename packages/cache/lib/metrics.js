"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheMetrics = void 0;
class CacheMetrics {
    constructor({ hits = 0, misses = 0, evictions = 0, loadSuccess = 0, loadError = 0 } = {}) {
        this.hits = hits;
        this.misses = misses;
        this.evictions = evictions;
        this.loadSuccess = loadSuccess;
        this.loadError = loadError;
    }
    get requests() {
        return (this.hits + this.misses) || 1;
    }
    get loads() {
        return (this.loadSuccess + this.loadError) || 1;
    }
    get rates() {
        return {
            hit: this.hits / this.requests,
            miss: this.misses / this.requests,
            loadOk: this.loadSuccess / this.loads,
            loadErr: this.loadError / this.loads
        };
    }
    reset() {
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
        this.loadSuccess = 0;
        this.loadError = 0;
    }
    toJSON() {
        return {
            hits: this.hits,
            misses: this.misses,
            evictions: this.evictions,
            loadSuccess: this.loadSuccess,
            loadError: this.loadError,
            rates: this.rates
        };
    }
    toString() {
        return Object.entries(this.toJSON())
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
    }
}
exports.CacheMetrics = CacheMetrics;
//# sourceMappingURL=metrics.js.map