import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import { RoomService } from './Services/RoomService';
import { RoomCache } from './Cache/RoomCache';
import admin from './Commands/admin';
import disable from './Commands/disable';
import enable from './Commands/enable';
import hide from './Commands/hide';
import kick from './Commands/kick';
import limit from './Commands/limit';
import lock from './Commands/lock';
import name from './Commands/name';
import owner from './Commands/owner';
import show from './Commands/show';
import unlock from './Commands/unlock';
import { Lang } from '../../Misc/Enums/Languages';

export class VoiceModule extends BaseModule {
	public names = {
		[Lang.en]: 'Private Channels',
		[Lang.ru]: 'Приватные комнаты'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Services
		this.registerService(RoomService);

		// Caches
		this.registerCache(RoomCache);

		// Commands
		this.registerCommand(admin);
		this.registerCommand(disable);
		this.registerCommand(enable);
		this.registerCommand(hide);
		this.registerCommand(kick);
		this.registerCommand(limit);
		this.registerCommand(lock);
		this.registerCommand(name);
		this.registerCommand(owner);
		this.registerCommand(show);
		this.registerCommand(unlock);
	}
}
