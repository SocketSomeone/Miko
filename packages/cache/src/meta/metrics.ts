export class MetricsCache {
	public hits = 0;

	public misses = 0;

	public evictions = 0;

	public loadSuccess = 0;

	public loadError = 0;

	private get requests(): number {
		return this.hits + this.misses;
	}

	private get loads(): number {
		return this.loadSuccess + this.loadError;
	}

	private get computeRates() {
		const [hit, miss] = this.rates(this.hits, this.misses, this.requests);
		const [loadOk, loadErr] = this.rates(this.loadSuccess, this.loadError, this.loads);

		return {
			hit,
			miss,
			loadOk,
			loadErr
		};
	}

	private rates(ok: number, error: number, total: number) {
		if (total === 0) {
			return [1, 0];
		}

		return [ok / total, error / total];
	}

	public reset(): void {
		this.hits = 0;
		this.misses = 0;
		this.evictions = 0;
		this.loadSuccess = 0;
		this.loadError = 0;
	}

	public toJSON(): { [key: string]: number | {} } {
		return {
			hits: this.hits,
			misses: this.misses,
			evictions: this.evictions,
			loadSuccess: this.loadSuccess,
			loadError: this.loadError,
			rates: this.computeRates
		};
	}

	public toString(): string {
		return Object.entries(this.toJSON())
			.map(([key, value]) => `#${key}: #${value}`)
			.join('\n');
	}
}
