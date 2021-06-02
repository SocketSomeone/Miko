import { injectable } from 'tsyringe';

@injectable()
export class SchedulerService {
	private intervals: Map<string, NodeJS.Timeout> = new Map();

	private timeouts: Map<string, NodeJS.Timeout> = new Map();
}
