import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'kiss',
			aliases: ['поцелуй', 'цом'],
			images: [
				'https://i.giphy.com/12VXIxKaIEarL2.gif',
				'https://i.giphy.com/QGc8RgRvMonFm.gif',
				'https://media3.giphy.com/media/VXsUx3zjzwMhi/giphy.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632935999823020042/nxLVk9C.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632936004986077213/YmbR885.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632936009457467453/anime-kissin-2.gif'
			]
		});
	}
}
