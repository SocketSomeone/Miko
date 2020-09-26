import { BaseClient } from '../../../Client';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'lick',
			aliases: ['лизь', 'лизнуть'],
			images: ['https://i.imgur.com/XchuI.gif', 'https://media1.giphy.com/media/8GiREm7aqMwN2/giphy.gif']
		});
	}
}
