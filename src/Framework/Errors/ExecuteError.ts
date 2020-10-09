import { InternalError } from './InternalError';

export class ExecuteError extends InternalError {
	constructor(data: string) {
		super(data);

		this.isWarn = true;
	}
}
