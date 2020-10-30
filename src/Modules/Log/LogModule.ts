import { BaseClient } from '../../Client';
import { BasePunishment } from '../../Entity/Punishment';
import { LoggingService } from './Services/LoggerService';
import { BaseModule } from '../../Framework/Module';

import disable from './Commands/disable';
import enable from './Commands/enable';
import set from './Commands/set';
import unset from './Commands/unset';

export class LogModule extends BaseModule {
	public names = {
		en: 'Logs',
		ru: 'Логирование'
	};

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
