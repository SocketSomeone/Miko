import moment, { Moment } from 'moment';

export class MetadataCache {
	private insertedAt = moment();

	private lastUsedAt = moment();

	private useCount = 0;

	public diff(now: Moment): number {
		return now.diff(this.insertedAt);
	}

	public use(): void {
		this.lastUsedAt = moment();
		this.useCount += 1;
	}
}
