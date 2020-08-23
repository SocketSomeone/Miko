import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { BaseClient } from '../../../Client';
import { Context, Command, TranslateFunc } from '../../../Framework/Commands/Command';
import { Message, Guild, GuildChannel } from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { CommandResolver } from '../../../Framework/Resolvers';
import { settings } from 'cluster';
import { Syntax } from '../../../Misc/Models/Syntax';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'help',
			aliases: ['помощь'],
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
			const desc = `info.help.cmdDesc.${c.name.toLowerCase()}`;

			await this.replyAsync(message, t, {
				title: t('info.help.cmd.title', {
					cmd: c.name
				}),
				fields: [
					{
						name: t('info.help.cmd.desc'),
						value: `${t(desc) === desc ? t('error.no') : t(desc)}`,
						inline: false
					},
					{
						name: t('info.help.cmd.ex'),
						inline: false,
						value: `${c.usage
							.replace(/{prefix}/g, prefix)
							.split(' ')
							.map((x, i) => {
								if (i === 0) return x;

								if (/user/g.test(x)) return message.member.mention;

								if (/channel/g.test(x)) return message.channel.mention;

								if (/role/g.test(x)) return `@role`;

								if (/duration/g.test(x)) return '1m';

								if (/reason/g.test(x)) return 'your reason';

								if (/money/g.test(x)) return '1000';

								if (/(page|count|index)/g.test(x)) return '1';

								return x.length >= 1 ? `\`${x}\`` : null;
							})
							.join(' ')}${c.extraExamples.length < 1 ? '' : '\n' + c.extraExamples}`
					},
					{
						name: t('info.help.cmd.aliases'),
						value: `${c.aliases.length >= 1 ? c.aliases.map((a) => `\`${a}\``).join(', ') : 'Отсутствуют'}`,
						inline: false
					}
				],
				footer: {
					text: null
				}
			});

			return;
		}

		const groups = Object.entries(CommandGroup).sort(([a], [b]) => a.localeCompare(b));

		this.showPaginated(t, message, 0, groups.length + 1, (page, maxPage) => {
			if (page === 0) {
				const embed = this.createEmbed({
					title: t('info.help.first.title'),
					thumbnail: {
						url: this.client.user.dynamicAvatarURL('png', 4096)
					},
					fields: [
						{
							name: t('info.help.first.fields.info'),
							value:
								'Здесь я должна была рассказать о себе и о том какая я клёвая, но видимо мой создатель ещё не дал мне листочек с которого должна читать :c\n\u200b',
							inline: false
						},
						{
							name: t('info.help.first.fields.modules'),
							value: `\n${groups.map(([key, val]) => `${val.toString()}`).join('\n')}\n\u200b\n`,
							inline: false
						},
						{
							name: t('info.help.first.fields.links'),
							value: `[SUPPORT](https://discord.gg/bRGH277)`,
							inline: true
						},
						{
							name: '\u200b',
							value: `[INVITE](https://discord.com/oauth2/authorize?client_id=718758028639207524&permissions=8&scope=bot)`,
							inline: true
						},
						{
							name: '\u200b',
							value: `[DEVELOPER](https://t.me/someonewillkillyou)`,
							inline: true
						}
					]
				});

				return embed;
			}

			const [key, val] = groups[page - 1];
			const commands = this.client.commands.commands.filter((x) => x.group === val);
			const pages: { name: string; value: string; inline?: boolean }[] = [];

			commands
				.sort((a, b) => a.usage.localeCompare(b.usage))
				.map((x, i) => {
					const name = i === 0 ? '📖 Вот и список команд:' : '\u200b';
					const desc = `info.help.cmdDesc.${x.name.toLowerCase()}`;
					const page = pages[~~(i / 5)];

					if (!page) {
						pages.push({
							name,
							value: `\`${x.usage.replace(/{prefix}/g, prefix)}\` - ${t(desc) === desc ? t('error.no') : t(desc)}`,
							inline: false
						});
					} else {
						page.value += `\n\n\`${x.usage.replace(/{prefix}/g, prefix)}\` - ${
							t(desc) === desc ? t('error.no') : t(desc)
						}`;
					}
				});

			const name = val.toString();

			const embed = this.createEmbed(
				{
					title: t('info.help.title'),
					fields: [
						{
							name,
							value: t(`info.help.moduleDesc.${key.toLowerCase()}`)
						},
						...pages
					],
					footer: {
						text: t('info.help.footer'),
						icon_url: this.client.user.dynamicAvatarURL('png', 4096)
					},
					thumbnail: {
						url: (guild && guild.dynamicIconURL()) || message.author.dynamicAvatarURL('png', 4096)
					},
					timestamp: new Date().toISOString()
				},
				false
			);

			return embed;
		});
	}
}
