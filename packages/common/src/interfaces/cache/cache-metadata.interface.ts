import moment from 'moment';

export class MetadataCache {
	private insertedAt = moment();

	// private lastUsedAt = moment();

	// private useCount = 1;

	public diff(): number {
		return moment().diff(this.insertedAt);
	}

	// public use(): void {
	// this.lastUsedAt = moment();
	// this.useCount += 1;
	// }
}
