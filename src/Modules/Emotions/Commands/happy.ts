import { BaseClient } from '../../../Client';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'happy',
			aliases: ['рад'],
			images: [
				'https://media.discordapp.net/attachments/632933675239211019/632941454494269451/orig.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632941456742547476/QLmb.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632941469820256276/1497288564_Sento_Isuzu_1.gif'
			]
		});
	}
}
