import { BaseClient } from '../../Client';

export abstract class BaseService {
	protected client: BaseClient = null;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public async init() {
		// NO-OP
	}

	public async onClientReady() {
		this.startupDone();
	}

	protected startupDone() {
		this.client.serviceStartupDone(this);
	}
}
