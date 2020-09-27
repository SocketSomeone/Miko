import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'bite',
			aliases: ['кусь', 'укусить'],
			images: [
				'https://media.discordapp.net/attachments/632933675239211019/632939263767478314/file_1.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939261858938900/file.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939265726218240/file_3.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632939268494589952/file_2.gif'
			]
		});
	}
}
