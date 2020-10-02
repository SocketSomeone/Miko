import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import { Lang } from '../../Misc/Enums/Languages';
import help from './Commands/help';

export class UtilitiesModule extends BaseModule {
	public names = {
		[Lang.en]: 'Utilities',
		[Lang.ru]: 'Утилиты'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Commands
		this.registerCommand(help);
	}
}
