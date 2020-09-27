import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'lick',
			aliases: ['лизь', 'лизнуть'],
			images: ['https://i.imgur.com/XchuI.gif', 'https://media1.giphy.com/media/8GiREm7aqMwN2/giphy.gif']
		});
	}
}
