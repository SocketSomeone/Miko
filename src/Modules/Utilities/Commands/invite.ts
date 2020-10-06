import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { BaseModule } from '../../../Framework/Module';
import { Images } from '../../../Misc/Enums/Images';
import { Color } from '../../../Misc/Enums/Colors';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'invite',
			aliases: ['инвайт', 'пригласить'],
			args: [],
			guildOnly: false,
			premiumOnly: false,
			examples: []
		});
	}

	public async execute(message: Message, [], { funcs: { t } }: Context) {
		await this.replyAsync(message, {
			author: { icon_url: Images.INVITE, name: t('utilities.invite.title') },
			description: t('utilities.invite.desc'),
			color: Color.MAGENTA,
			footer: null,
			timestamp: null
		});
	}
}
