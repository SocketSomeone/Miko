import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'pat',
			aliases: ['погладить', 'гладь'],
			images: [
				'https://media.tenor.co/images/bf646b7164b76efe82502993ee530c78/tenor.gif',
				'https://media.tenor.co/images/68d981347bf6ee8c7d6b78f8a7fe3ccb/tenor.gif',
				'https://i.giphy.com/iGZJRDVEM6iOc.gif'
			]
		});
	}
}
