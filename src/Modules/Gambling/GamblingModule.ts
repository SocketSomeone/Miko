import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';

import br from './Commands/br';
import casino from './Commands/casino';
import fortune from './Commands/fortune';
import race from './Commands/race/race';
import slotmachine from './Commands/slotmachine';
import whereischicken from './Commands/whereischicken';

export class GamblingModule extends BaseModule {
	public names = {
		en: 'Gambling',
		ru: 'Азартные игры'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Commands
		this.registerCommand(br);
		this.registerCommand(fortune);
		this.registerCommand(slotmachine);
		this.registerCommand(race);
		this.registerCommand(whereischicken);
		this.registerCommand(casino);
	}
}
