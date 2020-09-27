import { BaseModule } from '../../../Framework/Module';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'slap',
			aliases: ['hit', 'пощёчина', 'ударить'],
			images: [
				'https://i.giphy.com/10Im1VWMHQYfQI.gif',
				'http://i3.kym-cdn.com/photos/images/original/001/117/646/bf9.gif',
				'http://i0.kym-cdn.com/photos/images/newsfeed/000/940/326/086.gif',
				'https://i.giphy.com/LeTDEozJwatvW.gif',
				'https://i.giphy.com/Zau0yrl17uzdK.gif',
				'https://i.giphy.com/nesNeNkOb9Tz2.gif',
				'https://i.giphy.com/jLeyZWgtwgr2U.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632936507002322954/o2SJYUS.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632936513059029042/tenor.gif'
			]
		});
	}
}
