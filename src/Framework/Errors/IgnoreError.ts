import { InternalError } from './InternalError';

export class IgnoreError extends InternalError {
	constructor() {
		super('Error ignored');

		this.isWarn = false;
	}
}
