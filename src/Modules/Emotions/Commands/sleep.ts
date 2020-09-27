import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'sleep',
			aliases: ['спатьки', 'сплю'],
			images: [
				'https://media.discordapp.net/attachments/632933675239211019/632940656595042305/1365087083_431248369.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632940660634157057/171120_2128.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632940662094037000/932563943811e894af657992bd4993d7ebb2811f_hq.gif'
			]
		});
	}
}
