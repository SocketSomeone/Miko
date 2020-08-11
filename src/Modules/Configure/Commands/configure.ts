import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import { Syntax } from '../../../Misc/Enums/Syntax';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'config',
			aliases: ['conf', 'конфиг', 'конфигурация'],
			args: [],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_GUILD],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, []: [], { funcs: { t, e }, guild, settings }: Context) {
		await this.showPaginated(t, message, 0, 2, (page, maxPage) => {
			let embed = this.createEmbed(
				{
					color: ColorResolve(Color.GRAY),
					author: {
						name: t('configure.title', {
							guild: guild.name
						}),
						icon_url: message.author.dynamicAvatarURL()
					},
					thumbnail: {
						url: guild.dynamicIconURL('png', 4096)
					},
					footer: {
						text: null
					},
					timestamp: new Date().toISOString()
				},
				false
			);

			if (page === 0) {
				embed.fields = [
					{
						name: `⠀⠀⠀⠀⠀⠀⠀⠀Стандартные⠀⠀⠀⠀⠀⠀⠀⠀`.markdown(''),
						value: Object.entries(settings)
							.map(([key, i]) => {
								if (i !== null && typeof i === 'object') return null;

								const phrase = t(`configure.conf.main.${key}`);

								if (phrase.length < 1 || phrase === `configure.conf.main.${key}`) return null;

								let eq = `"${i}"`;

								if (/(рол)/gi.test(phrase)) {
									eq = guild.roles.has(i) ? guild.roles.get(i).name : null;
								}

								if (/(комнат|рум)/gi.test(phrase)) {
									eq = guild.channels.has(i) ? guild.channels.get(i).name : null;
								}

								if (typeof i === 'boolean' || i === null) {
									eq = i ? '✔' : '❌';
								}

								return `${phrase} - ${eq}`;
							})
							.filter((v) => !!v && v.length > 1)
							.sort((a, b) => a.localeCompare(b))
							.join('\n')
							.markdown(Syntax.YAML)
					}
				];
			} else if (page === 1) {
				const ignoredChannels = settings.autoModIgnoreChannels.filter((x) => guild.channels.has(x));

				const ignoredRoles = settings.autoModIgnoreRoles.filter((x) => guild.roles.has(x));

				embed.fields = [
					{
						name: `⠀⠀⠀⠀⠀⠀⠀⠀Автомодерация⠀⠀⠀⠀⠀⠀⠀⠀`.markdown(''),
						value: Object.entries(settings.autoMod)
							.map(([type, bool]) => `${t(`configure.conf.automod.${type.toString()}`)} - ${bool ? '✔' : '❌'}`)
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
				];
			}

			return embed;
		});
	}
}
