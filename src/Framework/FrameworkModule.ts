import { BaseClient } from '../Client';
import { GuildSettingsCache } from './Cache';
import { BaseModule } from './Module';
import { CommandService } from './Services/Commands';
import { MessagingService } from './Services/Messaging';
import { SchedulerService } from './Services/Scheduler';
import { RabbitMQService } from './Services/RabbitMQ/RabbitMQ';
import { Lang } from '../Misc/Enums/Languages';

export class FrameworkModule extends BaseModule {
	public names = {
		[Lang.en]: 'Framework'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Services
		this.registerService(CommandService);
		this.registerService(MessagingService);
		this.registerService(RabbitMQService);
		this.registerService(SchedulerService);

		// Caches
		this.registerCache(GuildSettingsCache);
	}
}
