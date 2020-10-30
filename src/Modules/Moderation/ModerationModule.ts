import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import { ModerationService } from './Services/Moderation';
import { PunishmentService } from './Services/Punishment';
import { WarnService } from './Services/WarnService';

import punishments from './Commands/info/punishments';
import warns from './Commands/info/warns';
import ban from './Commands/mod/ban';
import kick from './Commands/mod/kick';
import mute from './Commands/mod/mute';
import tempban from './Commands/mod/tempban';
import tempmute from './Commands/mod/tempmute';
import unmute from './Commands/mod/unmute';
import warn from './Commands/mod/warn';
import purge from './Commands/purge/purge';

export class ModerationModule extends BaseModule {
	public names = {
		en: 'Moderation',
		ru: 'Модерация'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Services
		this.registerService(ModerationService);
		this.registerService(PunishmentService);
		this.registerService(WarnService);

		// TODO: До лучший времен
		// this.registerService(AutoModerationService);

		// Commands

		this.registerCommand(ban);
		this.registerCommand(kick);
		this.registerCommand(mute);
		this.registerCommand(tempban);
		this.registerCommand(tempmute);
		this.registerCommand(unmute);
		this.registerCommand(warn);

		this.registerCommand(purge);

		this.registerCommand(punishments);
		this.registerCommand(warns);
	}
}
