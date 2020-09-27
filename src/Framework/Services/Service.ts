import { Guild } from 'eris';
import { BaseClient } from '../../Client';
import { BaseModule } from '../Module';

export abstract class BaseService {
	protected client: BaseClient;
	protected module: BaseModule;

	public constructor(module: BaseModule) {
		this.module = module;
		this.client = module.client;
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

	public async getDiagnose(guild: Guild): Promise<any> {
		// NO-OP
	}

	public getStatus(): any {
		// NO-OP
	}
}
