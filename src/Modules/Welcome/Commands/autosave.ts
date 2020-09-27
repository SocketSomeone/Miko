import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'welcome saveroles',
			aliases: [],
			args: [],
			group: CommandGroup.WELCOME,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, []: [], { funcs: { t, e }, settings }: Context) {
		if (!settings.welcomeEnabled) throw new ExecuteError(t('error.module.disabled'));

		settings.welcomeSaveRoles = !settings.welcomeSaveRoles;
		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: {
				name: t(`welcome.autosave.${settings.welcomeSaveRoles ? 'enable' : 'disable'}`),
				icon_url: Images.SUCCESS
			},
			footer: null,
			timestamp: null
		});
	}
}
