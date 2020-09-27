import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'kill',
			aliases: ['убить'],
			images: [
				'https://media.discordapp.net/attachments/632933675239211019/632934352895868928/ban.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632935137910456340/JLFwx5F.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632935138623488000/PaWqMRi.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632935139466412054/4IpVN2V.gif'
			]
		});
	}
}
