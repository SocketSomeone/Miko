import { InternalError } from './InternalError';

export class SendError extends InternalError {
	public fallbackUser = true;
}
