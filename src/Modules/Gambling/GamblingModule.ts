import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import br from './Commands/br';
import fortune from './Commands/fortune';
import race from './Commands/race/race';
import slotmachine from './Commands/slotmachine';
import whereischicken from './Commands/whereischicken';

export class GamblingModule extends BaseModule {
	public name: string = 'Gambling';

	public constructor(client: BaseClient) {
		super(client);

		// Commands
		this.registerCommand(br);
		this.registerCommand(fortune);
		this.registerCommand(slotmachine);
		this.registerCommand(race);
		this.registerCommand(whereischicken);
	}
}
