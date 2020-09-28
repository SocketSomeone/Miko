import { BaseClient } from '../Client';
import { GuildSettingsCache } from './Cache';
import { BaseModule } from './Module';
import { CommandService } from './Services/Commands';
import { MessagingService } from './Services/Messaging';
import { SchedulerService } from './Services/Scheduler';
import { RabbitMQService } from './Services/RabbitMQ';
import help from './Commands/Info/help';
import { BasePunishment } from '../Entity/Punishment';

export class FrameworkModule extends BaseModule {
	public name: string = 'Framework';

	public constructor(client: BaseClient) {
		super(client);

		// Services
		this.registerService(CommandService);
		this.registerService(MessagingService);
		this.registerService(RabbitMQService);
		this.registerService(SchedulerService);

		// Caches
		this.registerCache(GuildSettingsCache);

		// Commands
		this.registerCommand(help);
	}
}
