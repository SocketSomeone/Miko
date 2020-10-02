import { BaseClient } from '../../Client';
import { BasePunishment } from '../../Entity/Punishment';
import { BaseModule } from '../../Framework/Module';
import { MessagingService } from '../../Framework/Services/Messaging';
import { Lang } from '../../Misc/Enums/Languages';
import disable from './Commands/disable';
import enable from './Commands/enable';
import set from './Commands/set';
import unset from './Commands/unset';
import { LoggingService } from './Services/LoggerService';

export class LogModule extends BaseModule {
	public names = {
		[Lang.en]: 'Logs',
		[Lang.ru]: 'Логирование'
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
