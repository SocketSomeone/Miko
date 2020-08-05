import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { BaseClient } from '../../../Client';
import { Context, Command, TranslateFunc } from '../../../Framework/Commands/Command';
import { Message, Guild, GuildChannel } from 'eris';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'help',
			aliases: ['помощь'],
			group: CommandGroup.INFO,
			args: [],
			guildOnly: false,
			botPermissions: [GuildPermission.EMBED_LINKS, GuildPermission.ADD_REACTIONS],
			premiumOnly: false
		});
	}

	public async execute(message: Message, []: [], { funcs: { t }, guild, settings: { prefix } }: Context) {
		const groups = Object.entries(CommandGroup).sort(([a], [b]) => a.localeCompare(b));

		this.showPaginated(t, message, 0, groups.length, (page, maxPage) => {
			const [key, val] = groups[page];
			const commands = this.client.commands.commands.filter((x) => x.group === val);
			const pages: { name: string; value: string; inline?: boolean }[] = [];

			commands.map((x, i) => {
				const name = i === 0 ? 'А вот и список команд:' : '\u200b';
				const page = pages[~~(i / 5)];

				if (!page) {
					pages.push({
						name,
						value: x.usage.replace(/{prefix}/g, prefix).replace(/</g, '\\<'),
						inline: true
					});
				} else {
					page.value += `\n${x.usage.replace(/{prefix}/g, prefix).replace(/</g, '\\<')}`;
				}
			});

			const name = key.toString();
			const side = '⠀'.repeat(~~((50 - name.length) / 2));

			const embed = this.createEmbed(
				{
					title: t('info.help.title'),
					fields: [
						{
							name: `${side}${name}${side}`.markdown(''),
							value:
								'Здесь должно было описание самого клёвого модуля в данном боте, но видимо создатель немножко поленился и ещё не успел добавить его, подождите ещё немного! <3'
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
