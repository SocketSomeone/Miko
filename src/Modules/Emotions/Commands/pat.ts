import { BaseClient } from '../../../Client';
import { EmotionCommand } from '../Services/Emotion';

export default class extends EmotionCommand {
	public constructor(client: BaseClient) {
		super(client, {
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
