import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import award from './Commands/award';
import bal from './Commands/bal';
import buyshop from './Commands/buyshop';
import daily from './Commands/daily';
import give from './Commands/give';
import shop from './Commands/shop';
import take from './Commands/take';
import top from './Commands/top';

export class EconomyModule extends BaseModule {
	public name: string = 'Economy';

	public constructor(client: BaseClient) {
		super(client);

		// Commands
		this.registerCommand(award);
		this.registerCommand(bal);
		this.registerCommand(buyshop);
		this.registerCommand(daily);
		this.registerCommand(give);
		this.registerCommand(shop);
		this.registerCommand(take);
		this.registerCommand(top);
	}
}
