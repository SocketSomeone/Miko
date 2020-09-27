import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'cry',
			aliases: ['плак', 'плачу', 'sad', 'грущу'],
			images: [
				'https://media.discordapp.net/attachments/632933675239211019/632942591855296532/JRZ9.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632942592723779619/orig.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632942600504213515/1535478615.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632946935174660106/orig_1.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632946936541872158/giphy.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632946940681912339/orig.gif',
				'http://vignette3.wikia.nocookie.net/shigatsu-wa-kimi-no-uso/images/9/92/Tumblr_ndxgg75AmD1sgtx3io2_500.gif',
				'http://i.giphy.com/yarJ7WfdKiAkE.gif'
			]
		});
	}
}
