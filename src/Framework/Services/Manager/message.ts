import { BaseService } from '../Service';
import { EmbedOptions, Embed, TextableChannel, Message, GuildChannel, User, Emoji, Guild, VoiceChannel } from 'eris';
import { withScope, captureException } from '@sentry/node';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { TranslateFunc } from '../../Commands/Command';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { ChannelType, Modify, BaseEmbedOptions } from '../../../Types';

const upSymbol = 'left:736460400656384090';
const downSymbol = 'right:736460400089890867';

function convertEmbedToPlain(embed: EmbedOptions) {
	const url = embed.url ? `(${embed.url})` : '';
	const authorUrl = embed.author && embed.author.url ? `(${embed.author.url})` : '';

	let fields = '';
	if (embed.fields && embed.fields.length) {
		fields = '\n\n' + embed.fields.map((f) => `**${f.name}**\n${f.value}`).join('\n\n') + '\n\n';
	}

	return (
		'**Failed to send embed...\nEmbedded links disabled for this channel.**\n' +
		(embed.author ? `_${embed.author.name}_ ${authorUrl}\n` : '') +
		(embed.title ? `**${embed.title}** ${url}\n` : '') +
		(embed.description ? embed.description + '\n' : '') +
		fields +
		(embed.footer ? `_${embed.footer.text}_` : '')
	);
}

export class MessageService extends BaseService {
	public createEmbed(options: BaseEmbedOptions = {}): Embed {
		let color = options.color ? (options.color as number | string) : Color.PRIMARY;

		// Parse colors in hashtag/hex format
		if (typeof color === 'string') {
			color = ColorResolve(color);
		}

		const footer = typeof options.footer === 'undefined' ? this.defaultFooter : options.footer;
		const timestamp = typeof options.timestamp === 'undefined' ? new Date().toISOString() : options.timestamp;

		delete options.color;

		return {
			...options,
			type: 'rich',
			color,
			footer,
			timestamp,
			fields: options.fields ? options.fields : []
		};
	}

	get defaultFooter() {
		return {
			text: `✨ Miko`,
			icon_url: this.client.user.dynamicAvatarURL('png', 4096)
		};
	}

	public sendReply(message: Message, t: TranslateFunc, reply: BaseEmbedOptions | string) {
		return this.sendEmbed(message.channel, t, reply, message.author);
	}

	public sendEmbed(target: TextableChannel, t: TranslateFunc, embed: BaseEmbedOptions | string, fallbackUser?: User) {
		const e = typeof embed === 'string' ? this.createEmbed({ description: embed }) : this.createEmbed(embed);

		e.fields = e.fields
			.filter((x) => x && x.value)
			.map((x) => {
				x.value = x.value.substring(0, 1024);
				return x;
			});

		const content = convertEmbedToPlain(e);

		const handleException = (err: Error, reportIndicent = true) => {
			withScope((scope) => {
				if (target instanceof GuildChannel) {
					scope.setUser({ id: target.guild.id });
					scope.setExtra('permissions', target.permissionsOf(this.client.user.id).json);
				}

				scope.setExtra('channel', target.id);
				scope.setExtra('message', embed);
				scope.setExtra('content', content);

				if (fallbackUser) {
					scope.setExtra('fallbackUser', fallbackUser.id);
				}

				captureException(err);
			});
		};

		return new Promise<Message>((resolve, reject) => {
			const sendDM = async (error?: any): Promise<Message> => {
				if (!fallbackUser) {
					return undefined;
				}

				try {
					const channel = await fallbackUser.getDMChannel();

					let msg = t('embed.notificationDeveloper', {
						error: error ? error.message : t('error.unknown')
					});

					if (error && error.code === 50013) {
						msg = t('embed.missPermissions', {
							name: this.client.user.username,
							channelId: target.id
						});
					}

					try {
						return await channel.createMessage(msg);
					} catch (err) {
						if (err.code === 50007) {
							// NO-OP
						} else {
							handleException(err, false);
						}

						return undefined;
					}
				} catch (e) {
					handleException(e, false);

					return undefined;
				}
			};

			const sendPlain = async (error?: any): Promise<Message> => {
				// If we don't have permission to send messages try DM
				if (
					target instanceof GuildChannel &&
					!target.permissionsOf(this.client.user.id).has(GuildPermission.SEND_MESSAGES)
				) {
					return sendDM({ code: 50013 });
				}

				try {
					return await target.createMessage(content);
				} catch (err) {
					handleException(err);
					return sendDM(error);
				}
			};

			const send = async (): Promise<Message> => {
				if (
					target instanceof GuildChannel &&
					(!target.permissionsOf(this.client.user.id).has(GuildPermission.SEND_MESSAGES) ||
						!target.permissionsOf(this.client.user.id).has(GuildPermission.EMBED_LINKS))
				) {
					return sendPlain();
				}

				try {
					return await target.createMessage({ embed: e });
				} catch (e) {
					handleException(e);

					return sendPlain();
				}
			};

			resolve(send());
		});
	}

	public async showPaginated(
		t: TranslateFunc,
		prevMsg: Message,
		page: number,
		maxPage: number,
		render: (page: number, maxPage: number) => Embed,
		author?: User
	) {
		const embed = render(page, maxPage);

		let doPaginate = true;
		if (prevMsg.channel instanceof GuildChannel) {
			const perm = prevMsg.channel.permissionsOf(this.client.user.id);
			if (
				!perm.has(GuildPermission.ADD_REACTIONS) ||
				!perm.has(GuildPermission.MANAGE_MESSAGES) ||
				!perm.has(GuildPermission.READ_MESSAGE_HISTORY)
			) {
				doPaginate = false;
			}
		}

		if ((page > 0 || page < maxPage - 1) && !embed.footer) {
			embed.footer = {
				...embed.footer,
				text: `${t('others.page')}: ${page + 1}/${maxPage}`
			};
		}

		const sudo: boolean = (prevMsg as any).__sudo;

		if (prevMsg.author.id === this.client.user.id) {
			await prevMsg.edit({ embed });
		} else {
			author = prevMsg.author;
			prevMsg = await this.sendEmbed(prevMsg.channel, t, embed, prevMsg.author);

			if (maxPage !== 1) {
				await prevMsg.addReaction(upSymbol);
				await prevMsg.addReaction(downSymbol);
			}

			if (!prevMsg) {
				return;
			}
		}

		if (sudo || !doPaginate) {
			return;
		}

		if (page > 0 || page < maxPage - 1) {
			let timer: NodeJS.Timer;

			const func = async (msg: Message, emoji: Emoji, userId: string) => {
				if (msg.id !== prevMsg.id || userId !== author.id) {
					return;
				}

				const emojiTest = `${emoji.name}:${emoji.id}`;

				if (emojiTest !== downSymbol && emojiTest !== upSymbol) {
					return;
				}

				prevMsg.removeReaction(emojiTest, author.id).catch(undefined);

				const isUp = emojiTest === upSymbol;

				const clear = async () => {
					clearInterval(timer);
					this.client.removeListener('messageReactionAdd', func);
				};

				if (isUp && page > 0) {
					clear();
					await this.showPaginated(t, prevMsg, page - 1, maxPage, render, author);
				} else if (!isUp && page < maxPage - 1) {
					clear();
					await this.showPaginated(t, prevMsg, page + 1, maxPage, render, author);
				}
			};

			this.client.on('messageReactionAdd', func);

			const timeOut = async () => {
				this.client.removeListener('messageReactionAdd', func);
				prevMsg.removeReactions().catch(() => undefined);
			};

			timer = setTimeout(timeOut, 5 * 60 * 1000);
		}
	}

	public fillTemplate(msg: string, strings?: { [x: string]: string | number }): string | Embed {
		if (strings) {
			Object.keys(strings).forEach((k) => (msg = msg.replace(new RegExp(`{${k}}`, 'g'), String(strings[k]))));
		}

		try {
			const temp = JSON.parse(msg);

			let embed = (temp && temp.embed) || temp;

			if (typeof embed.thumbnail === 'string') {
				embed.thumbnail = {
					url: embed.thumbnail || null
				};
			}

			if (typeof embed.image === 'string') {
				embed.image = {
					url: embed.image || null
				};
			}

			embed.footer = embed.footer || null;
			embed.timestamp = embed.timestamp || null;

			return this.createEmbed(embed);
		} catch (e) {
			//
		}

		return msg;
	}

	private async getDefaultChannel(guild: Guild) {
		if (guild.channels.has(guild.id)) {
			return guild.channels.get(guild.id);
		}

		const gen = guild.channels.find((c) => c.name === 'general' && c.type === ChannelType.GUILD_TEXT);

		if (gen) {
			return gen;
		}

		return guild.channels
			.filter((c) => c.type === ChannelType.GUILD_TEXT && c.permissionsOf(this.client.user.id).has('SEND_MESSAGES'))
			.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))[0];
	}
}
