import { Context, BaseCommand, TranslateFunc } from '../../../Framework/Commands/Command';
import { EmbedField, Guild, Message } from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { AnyResolver, CommandResolver } from '../../../Framework/Resolvers';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';
import { ModuleResolver } from '../../../Framework/Resolvers/ModuleResolver';
import { FrameworkModule } from '../../../Framework/FrameworkModule';
import { Lang } from '../../../Misc/Enums/Languages';

interface ModuleContext {
	module: BaseModule;
	guild: Guild;
	t: TranslateFunc;
	locale: Lang;
	prefix: string;
}

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'help',
			aliases: ['помощь', 'h'],
			args: [
				{
					name: 'command | module',
					resolver: new AnyResolver(module, ModuleResolver, CommandResolver),
					required: false,
					full: true
				}
			],
			guildOnly: false,
			botPermissions: [GuildPermission.EMBED_LINKS, GuildPermission.ADD_REACTIONS],
			premiumOnly: false,
			examples: ['Configure', 'ban']
		});
	}

	public async execute(
		message: Message,
		[x]: [BaseCommand | BaseModule],
		{ funcs: { t }, guild, settings: { prefix, locale } }: Context
	) {
		if (x instanceof BaseCommand) {
			await this.replyAsync(message, x.getHelp(t, prefix));
		} else if (x instanceof BaseModule) {
			await this.replyAsync(
				message,
				this.moduleInfo({
					t,
					prefix,
					locale,
					module: x,
					guild
				})
			);
		} else {
			const groups = [...this.client.modules.values()]
				.filter((m) => !(m instanceof FrameworkModule))
				.sort((a, b) => a.names[locale].localeCompare(b.names[locale]));

			this.showPaginated(message, 0, groups.length, (page) => {
				return this.moduleInfo({
					t,
					prefix,
					locale,
					module: groups[page],
					guild
				});
			});
		}
	}

	moduleInfo({ t, prefix, locale, module, guild }: ModuleContext) {
		const commands = [...this.client.commands.values()].filter((x) => x.module === module);
		const fields: EmbedField[] = [];

		commands
			.sort((a, b) => a.usage.localeCompare(b.usage))
			.map((x, i) => {
				const desc = t(`info.help.cmdDesc.${x.name.toLowerCase()}`);
				const page = fields[~~(i / 15)];

				if (!page) {
					fields.push({
						name: `📚 ${module.names[locale]}`,
						value: `\`${prefix + x.usage}\` - ${desc}`,
						inline: false
					});
				} else {
					page.value += `\n\n\`${prefix + x.usage}\` - ${desc}`;
				}
			});

		const embed = this.createEmbed({
			author: {
				name: t('info.help.title'),
				icon_url: Images.HELP
			},
			fields,
			description: t('info.help.desc', {
				botId: this.client.user.id,
				prefix
			}),
			footer: {
				text: t('info.help.footer'),
				icon_url: this.client.user.dynamicAvatarURL('png', 4096)
			},
			thumbnail: {
				url: (guild && guild.dynamicIconURL('png', 4096)) || this.client.user.dynamicAvatarURL('png', 4096)
			}
		});

		return embed;
	}
}
