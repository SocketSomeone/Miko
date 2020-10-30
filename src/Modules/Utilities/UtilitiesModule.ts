import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import avatar from './Commands/avatar';
import help from './Commands/help';
import invite from './Commands/invite';

export class UtilitiesModule extends BaseModule {
	public names = {
		en: 'Utilities',
		ru: 'Утилиты'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Commands
		this.registerCommand(help);
		this.registerCommand(avatar);
		this.registerCommand(invite);
	}
}
