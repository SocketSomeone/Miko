import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BigIntResolver, StringResolver } from '../../../Framework/Resolvers';
import { EmojisDefault } from '../../../Misc/Enums/EmojisDefaults';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'setcurrency',
			aliases: [],
			args: [
				{
					name: 'emoji',
					resolver: StringResolver,
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [emoji]: [string], { funcs: { t, e }, guild, settings }: Context) {
		console.log(emoji);
		if (emoji) {
			const checked = e(emoji);

			if (checked === EmojisDefault.UNKNOWN_EMOJI) throw new ExecuteError(t('error.emoji.notFound'));

			settings.currency = emoji;
		} else {
			settings.currency = EmojisDefault.WALLET;
		}

		await settings.save();

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(`configure.setcurrency`, {
				currency: settings.currency
			}),
			footer: {
				text: ''
			}
		});
	}
}
