import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'hug',
			aliases: ['обнять', 'обнимашки'],
			images: [
				'https://i.giphy.com/143v0Z4767T15e.gif',
				'https://data.whicdn.com/images/135392484/original.gif',
				'https://media.giphy.com/media/svXXBgduBsJ1u/giphy.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939966019665990/file_3.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939968162955279/file_4.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939971929440256/file_1.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939976245379082/file_2.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939981132005413/file.gif'
			]
		});
	}
}
