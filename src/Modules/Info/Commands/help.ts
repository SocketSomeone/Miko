import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { CommandResolver } from '../../../Framework/Resolvers';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'help',
			aliases: ['помощь', 'h'],
			group: null,
			args: [
				{
					name: 'command',
					resolver: CommandResolver,
					required: false
				}
			],
			guildOnly: false,
			botPermissions: [GuildPermission.EMBED_LINKS, GuildPermission.ADD_REACTIONS],
			premiumOnly: false
		});
	}

	public async execute(message: Message, [c]: [Command], { funcs: { t }, guild, settings: { prefix } }: Context) {
		if (c) {
			const embed = c.getHelp(message, t, prefix);
			await this.replyAsync(message, t, embed);

			return;
		}

		const groups = Object.entries(CommandGroup)
			.sort(([a], [b]) => a.localeCompare(b))
			.filter(([key]) => key.length > 1);

		this.showPaginated(t, message, 0, groups.length + 1, (page, maxPage) => {
			if (page === 0) {
				const embed = this.createEmbed({
					author: { name: t('info.help.first.title'), icon_url: Images.LIST },
					thumbnail: {
						url: this.client.user.dynamicAvatarURL('png', 4096)
					},
					description: t('others.onBotAdd.desc', {
						modules: `${groups.map(([key]) => t(`others.modules.${key.toLowerCase()}`)).join('\n')}`
					}),
					fields: [
						{
							name: '\u200b',
							value: t('others.onBotAdd.field'),
							inline: false
						}
					],
					footer: {
						icon_url: this.client.user.dynamicAvatarURL('png', 4096),
						text: t('info.help.first.footer')
					},
					timestamp: null
				});

				return embed;
			}

			const [group, i] = groups[page - 1];
			const commands = this.client.commands.commands.filter((x) => x.group === i);
			const pages: { name: string; value: string; inline?: boolean }[] = [];

			commands
				.sort((a, b) => a.usage.localeCompare(b.usage))
				.map((x, i) => {
					const name = i === 0 ? '📖 Вот и список команд:' : '\u200b';
					const desc = `info.help.cmdDesc.${x.name.toLowerCase()}`;
					const page = pages[~~(i / 15)];

					if (!page) {
						pages.push({
							name,
							value: `\`${prefix + x.usage}\` - ${t(desc) === desc ? t('error.no') : t(desc)}`,
							inline: false
						});
					} else {
						page.value += `\n\n\`${prefix + x.usage}\` - ${t(desc) === desc ? t('error.no') : t(desc)}`;
					}
				});

			const embed = this.createEmbed({
				author: { name: t('info.help.title'), icon_url: Images.LIST },
				fields: [
					{
						name: t(`others.modules.${group.toLowerCase()}`),
						value: t(`info.help.moduleDesc.${group.toLowerCase()}`)
					},
					...pages
				],
				footer: {
					text: t('info.help.footer'),
					icon_url: this.client.user.dynamicAvatarURL('png', 4096)
				},
				thumbnail: {
					url: (guild && guild.dynamicIconURL()) || message.author.dynamicAvatarURL('png', 4096)
				}
			});

			return embed;
		});
	}
}
