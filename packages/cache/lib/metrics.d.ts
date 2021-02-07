interface ICacheMetricsRates {
    hit: number;
    miss: number;
    loadOk: number;
    loadErr: number;
}
interface ICacheMetrics {
    hits?: number;
    misses?: number;
    evictions?: number;
    loadSuccess?: number;
    loadError?: number;
    rates?: ICacheMetricsRates;
}
export declare class CacheMetrics implements ICacheMetrics {
    hits: number;
    misses: number;
    evictions: number;
    loadSuccess: number;
    loadError: number;
    constructor({ hits, misses, evictions, loadSuccess, loadError }?: ICacheMetrics);
    get requests(): number;
    get loads(): number;
    get rates(): ICacheMetricsRates;
    reset(): void;
    toJSON(): ICacheMetrics;
    toString(): string;
}
export {};
//# sourceMappingURL=metrics.d.ts.map