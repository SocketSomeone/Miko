import { BaseService } from './Service';
import { EmbedOptions, Embed, TextableChannel, Message, GuildChannel, User, Emoji } from 'eris';
import { withScope, captureException } from '@sentry/node';
import { GuildPermission } from '../../Misc/Models/GuildPermissions';
import { Color } from '../../Misc/Enums/Colors';
import { ColorResolve } from '../../Misc/Utils/ColorResolver';
import { BaseEmbedOptions } from '../../Types';
import { SendError } from '../Errors/SendError';

const upSymbol = 'left:736460400656384090';
const downSymbol = 'right:736460400089890867';

export class MessagingService extends BaseService {
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
			text: `🌸 Miko`,
			icon_url: this.client.user.dynamicAvatarURL('png', 4096)
		};
	}

	public async sendReply(message: Message, reply: BaseEmbedOptions | string, ttl: number = null) {
		const m = await this.sendEmbed(message.channel, reply);

		if (!ttl) {
			return m;
		}

		setTimeout(() => {
			m.delete().catch(() => undefined);
		}, ttl);

		return null;
	}

	public sendEmbed(target: TextableChannel, embed: BaseEmbedOptions | string) {
		const e = typeof embed === 'string' ? this.createEmbed({ description: embed }) : this.createEmbed(embed);

		e.fields = e.fields
			.filter((x) => x && x.value)
			.map((x) => {
				x.value = x.value.substring(0, 1024);
				return x;
			});

		return new Promise<Message>(async (resolve, reject) => {
			if (target instanceof GuildChannel) {
				if (!target.permissionsOf(this.client.user.id).has(GuildPermission.SEND_MESSAGES)) {
					return reject(new SendError(`I don't have permission to send messages in this channel.`));
				}

				if (!target.permissionsOf(this.client.user.id).has(GuildPermission.EMBED_LINKS)) {
					return reject(
						new SendError(
							`I don't have permission to send embeds.\nEnable "Embed Links" permission for Miko in this channel.`
						)
					);
				}
			}

			try {
				return resolve(await target.createMessage({ embed: e }));
			} catch (err) {
				if (err.code === 50007) {
					return;
				}

				withScope((scope) => {
					if (target instanceof GuildChannel) {
						scope.setUser({ id: target.guild.id });
						scope.setExtra('permissions', target.permissionsOf(this.client.user.id).json);
					}
					scope.setExtra('channel', target.id);
					scope.setExtra('message', embed);
					captureException(err);
				});

				return reject(new SendError('An error occured while sending a message.'));
			}
		});
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

			return this.createEmbed({
				footer: null,
				timestamp: null,
				...embed
			});
		} catch (e) {
			// NO-OP
		}

		return msg;
	}

	public async showPaginated(
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
				text: `${page + 1}/${maxPage}`
			};
		}

		const sudo: boolean = (prevMsg as any).__sudo;

		if (prevMsg.author.id === this.client.user.id) {
			await prevMsg.edit({ embed });
		} else {
			author = prevMsg.author;
			prevMsg = await this.sendEmbed(prevMsg.channel, embed);

			if ((page > 0 || page < maxPage - 1) && doPaginate) {
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

				if (prevMsg.channel instanceof GuildChannel) {
					prevMsg.removeReaction(emojiTest, author.id).catch(() => undefined);
				}

				const isUp = emojiTest === upSymbol;

				const clear = async () => {
					clearInterval(timer);
					this.client.removeListener('messageReactionAdd', func);
				};

				if (isUp && page > 0) {
					clear();
					await this.showPaginated(prevMsg, page - 1, maxPage, render, author);
				} else if (!isUp && page < maxPage - 1) {
					clear();
					await this.showPaginated(prevMsg, page + 1, maxPage, render, author);
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

	public async awaitReactions(
		prevMsg: Message,
		filter: (userID: string) => Promise<boolean>,
		{ ttl, reactions }: { ttl: number; reactions: string[] }
	) {
		return new Promise((resolve) => {
			reactions.forEach((r) => prevMsg.addReaction(r).catch(() => undefined));

			const func = async (msg: Message, emoji: Emoji, userId: string) => {
				if (msg.id !== prevMsg.id) {
					return;
				}

				if (!reactions.includes(emoji.name)) {
					return;
				}

				await filter(userId);
			};

			this.client.on('messageReactionAdd', func);

			const timeOut = async () => {
				this.client.removeListener('messageReactionAdd', func);
				prevMsg.removeReactions().catch(() => undefined);

				resolve();
			};

			setTimeout(timeOut, ttl);
		});
	}
}

export type CreateEmbedFunc = (options?: BaseEmbedOptions) => Embed;
export type ReplyFunc = (message: Message, reply: BaseEmbedOptions | string, ttl?: number) => Promise<Message>;
export type SendFunc = (target: TextableChannel, embed: EmbedOptions | string) => Promise<Message>;

export type ShowPaginatedFunc = (
	prevMsg: Message,
	page: number,
	maxPage: number,
	render: (page: number, maxPage: number) => Embed
) => Promise<void>;

export type awaitReactionsFunc = (
	prevMsg: Message,
	func: (userID: string) => Promise<any>,
	sets: { ttl: number; reactions: string[] }
) => Promise<any>;
