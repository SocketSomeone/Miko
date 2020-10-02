import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import { Lang } from '../../Misc/Enums/Languages';
import add from './Commands/add';
import clear from './Commands/clear';
import list from './Commands/list';
import move from './Commands/move';
import remove from './Commands/remove';

export class PermissionsModule extends BaseModule {
	public names = {
		[Lang.en]: 'Permissions',
		[Lang.ru]: 'Правила для команд'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Commands
		this.registerCommand(add);
		this.registerCommand(clear);
		this.registerCommand(list);
		this.registerCommand(move);
		this.registerCommand(remove);
	}
}
