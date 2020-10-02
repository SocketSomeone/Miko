import { BaseClient } from '../../Client';
import { BaseModule } from '../../Framework/Module';
import { Lang } from '../../Misc/Enums/Languages';
import angry from './Commands/angry';
import bite from './Commands/bite';
import cry from './Commands/cry';
import happy from './Commands/happy';
import hug from './Commands/hug';
import kill from './Commands/kill';
import kiss from './Commands/kiss';
import lick from './Commands/lick';
import pat from './Commands/pat';
import sex from './Commands/sex';
import slap from './Commands/slap';
import sleep from './Commands/sleep';

export class EmotionsModule extends BaseModule {
	public names = {
		[Lang.en]: 'Emotions',
		[Lang.ru]: 'Эмоции'
	};

	public constructor(client: BaseClient) {
		super(client);

		// Commands
		this.registerCommand(angry);
		this.registerCommand(bite);
		this.registerCommand(cry);
		this.registerCommand(happy);
		this.registerCommand(hug);
		this.registerCommand(kill);
		this.registerCommand(kiss);
		this.registerCommand(lick);
		this.registerCommand(pat);
		this.registerCommand(sex);
		this.registerCommand(slap);
		this.registerCommand(sleep);
	}
}
