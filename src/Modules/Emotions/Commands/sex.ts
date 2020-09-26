import { BaseClient } from '../../../Client';
import { EmotionCommand } from '../Services/EmotionCommand';

export default class extends EmotionCommand {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'sex',
			aliases: ['секс', 'изнасиловать'],
			images: [
				'https://media.discordapp.net/attachments/632933675239211019/632938035809484800/community_image_1425782798.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632938059184341012/1511784053_02acbb9fa1f4c9b7f7ef62a7659a05e34509c1c0_hq.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632938622710185994/1384479142_monogatari-2nd-season-episode-19-omake-6.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632943826373312512/1kWn.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632944256838926336/14033583812338.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632944259301113887/1509277285_1468394272_68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d.gif',
				'https://media.discordapp.net/attachments/632933675239211019/632944262740443156/orig.gif'
			]
		});
	}
}
