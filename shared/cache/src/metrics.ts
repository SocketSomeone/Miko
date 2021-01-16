interface ICacheMetrics {
    hits?       : number;
    misses?     : number;
    evictions?  : number;
    loadSuccess?: number;
    loadError?  : number;
}

export class CacheMetrics implements ICacheMetrics {
    public hits       : number;
    public misses     : number;
    public evictions  : number;
    public loadSuccess: number;
    public loadError  : number;

    public constructor({
        hits        = 0,
        misses      = 0,
        evictions   = 0,
        loadSuccess = 0,
        loadError   = 0
    }: ICacheMetrics = {}) {
        this.hits        = hits;
        this.misses      = misses;
        this.evictions   = evictions;
        this.loadSuccess = loadSuccess;
        this.loadError   = loadError;
    }

    public get requests() {
        return (this.hits + this.misses) || 1;
    }

    public get loads() {
        return (this.loadSuccess + this.loadError) || 1;
    }

    public get rates() {
        return {
            hit    : this.hits / this.requests,
            miss   : this.misses / this.requests,
            loadOk : this.loadSuccess / this.loads,
            loadErr: this.loadError / this.loads
        }
    }

    public reset() {
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
        this.loadSuccess = 0;
        this.loadError = 0;
    }

    public toJSON() {
        return {
            hits: this.hits,
            misses: this.misses,
            evictions: this.evictions,
            loadSuccess: this.loadSuccess,
            loadError: this.loadError,
            rates: this.rates
        }
    }

    public toString() {
        return JSON.stringify(
            this.toJSON()
        );
    }
}