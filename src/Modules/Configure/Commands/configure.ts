import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import { Violation } from '../../../Misc/Models/Violation';
import { EmojisDefault } from '../../../Misc/Models/GuildSetting';
import { Syntax } from '../../../Misc/Enums/Syntax';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'configure',
			aliases: ['conf', 'config', 'configuration', 'конфигурация'],
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
			let embed = this.createEmbed({
				color: ColorResolve(Color.GRAY),
				author: {
					name: t('configure.title', {
						guild: guild.name
					}),
					icon_url: message.author.dynamicAvatarURL()
				},
				thumbnail: {
					url: guild.iconURL
				},
				timestamp: new Date().toISOString()
			});

			if (page === 0) {
				embed.fields = [
					{
						name: `⠀⠀⠀⠀⠀⠀⠀⠀Стандартные⠀⠀⠀⠀⠀⠀⠀⠀⠀`.markdown(''),
						value: Object.entries(settings)
							.map(([key, i]) => {
								if (i !== null && typeof i === 'object') return null;

								const phrase = t(`configure.conf.main.${key}`);

								if (phrase.length < 1) return null;

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
				embed.fields = [
					{
						name: `⠀⠀⠀⠀⠀⠀⠀⠀⠀Автомодерация⠀⠀⠀⠀⠀⠀⠀`.markdown(''),
						value: Object.entries(settings.autoMod)
							.map(([type, bool]) => `${t(`configure.conf.automod.${type.toString()}`)} - ${bool ? '✔' : '❌'}`)
							.sort((a, b) => a.localeCompare(b))
							.join('\n')
							.markdown(Syntax.YAML)
					}
				];
			}

			return embed;
		});
	}
}
