import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { Message } from 'eris';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Images } from '../../../../Misc/Enums/Images';
import { Syntax } from '../../../../Misc/Models/Syntax';
import { BaseModule } from '../../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'automod info',
			aliases: ['automod list'],
			args: [],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		const ignoredChannels = [...settings.autoModIgnoreChannels].filter((x) => guild.channels.has(x));
		const ignoredRoles = [...settings.autoModIgnoreRoles].filter((x) => guild.roles.has(x));

		let embed = this.createEmbed({
			color: Color.GRAY,
			thumbnail: { url: guild.iconURL },
			author: {
				name: t('automod.title', { guild: guild.name }),
				icon_url: Images.SETTINGS
			},
			fields: [
				{
					name: `⠀⠀⠀⠀⠀⠀⠀⠀Автомодерация⠀⠀⠀⠀⠀⠀⠀⠀`.markdown(''),
					value: Object.entries(settings.autoMod)
						.map(([type, bool]) => `${t(`automod.info.${type.toString()}`)} - ${bool ? '✔' : '❌'}`)
						.sort((a, b) => a.localeCompare(b))
						.join('\n')
						.markdown(Syntax.YAML),
					inline: false
				},
				{
					name: `⠀Игнорируемые Роли⠀`.markdown(''),
					inline: true,
					value:
						ignoredRoles.length < 1
							? 'Отсутствуют.'
							: ignoredRoles
									.map((r) => guild.roles.get(r).mention)
									.join('\n')
									.slice(0, 1024)
				},
				{
					name: `⠀Игнорируемые Чаты⠀`.markdown(''),
					inline: true,
					value:
						ignoredChannels.length < 1
							? 'Отсутствуют.'
							: ignoredChannels
									.map((c) => guild.channels.get(c).mention)
									.join('\n')
									.slice(0, 1024)
				}
			],
			footer: null
		});

		await this.replyAsync(message, embed);
	}
}
