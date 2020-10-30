import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import { ReactionRoleCache } from './Cache/ReactionRole';
import { ShopRolesCache } from './Cache/ShopRole';
import addshop from './Commands/addshop';
import modlog from './Commands/modlog';
import muterole from './Commands/muterole';
import prefix from './Commands/prefix';
import reactionRoles from './Commands/reactionRoles';
import removeshop from './Commands/removeshop';
import say from './Commands/say';
import setcurrency from './Commands/setcurrency';
import standartMoney from './Commands/standart-money';
import { ReactionRoleService } from './Services/ReactionRoles';

export class ConfigureModule extends BaseModule {
	public names = {
		en: 'Configure',
		ru: 'Конфигурация'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Services
		this.registerService(ReactionRoleService);

		// Caches
		this.registerCache(ReactionRoleCache);
		this.registerCache(ShopRolesCache);

		// Commands
		this.registerCommand(addshop);
		this.registerCommand(modlog);
		this.registerCommand(muterole);
		this.registerCommand(prefix);
		this.registerCommand(reactionRoles);
		this.registerCommand(removeshop);
		this.registerCommand(say);
		this.registerCommand(setcurrency);
		this.registerCommand(standartMoney);
	}
}
