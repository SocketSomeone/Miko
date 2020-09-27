import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'angry',
			aliases: ['злица', 'злюсь'],
			images: [
				'https://media.giphy.com/media/RMUKZW6Wmy2mk/giphy.gif',
				'https://media.giphy.com/media/yFLSs5jbhUgeI/giphy.gif',
				'http://img1.liveinternet.ru/images/attach/c/5/87/401/87401949_tumblr_lo5ntp6FIl1qcff4ao1_500.gif',
				'https://media.tenor.co/images/386fb4996e952415422e4de3f7ff9273/tenor.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632945459211796510/orig.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632946452452081665/1464620853_1583.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632946456315035671/1464620696_1582.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632946458882211869/image_860508182351165005544.gif'
			]
		});
	}
}
