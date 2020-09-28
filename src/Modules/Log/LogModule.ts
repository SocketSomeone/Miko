import { BaseClient } from '../../Client';
import { BasePunishment } from '../../Entity/Punishment';
import { BaseModule } from '../../Framework/Module';
import { MessagingService } from '../../Framework/Services/Messaging';
import disable from './Commands/disable';
import enable from './Commands/enable';
import set from './Commands/set';
import unset from './Commands/unset';
import { LoggingService } from './Services/LoggerService';

export class LogModule extends BaseModule {
	public name: string = 'Log';

	public constructor(client: BaseClient) {
		super(client);

		// Services
		this.registerService(LoggingService);

		// Commands
		this.registerCommand(disable);
		this.registerCommand(enable);
		this.registerCommand(set);
		this.registerCommand(unset);

		// Entity Injections
		client.setupInjections(BasePunishment);
	}
}
