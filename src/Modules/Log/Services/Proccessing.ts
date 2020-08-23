import { BaseClient } from '../../../Client';
import {
	TextChannel,
	Member,
	Guild,
	Constants,
	EmbedOptions,
	User,
	AnyChannel,
	VoiceChannel,
	NewsChannel,
	Embed,
	Emoji,
	Role,
	Message
} from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { LogType } from '../Misc/LogType';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
export type ProcessFuncs = { [key in LogType]: (t: TranslateFunc, guild: Guild, ...args: any[]) => Promise<Embed> };

type GuildChannel = TextChannel | VoiceChannel | NewsChannel;

export class ProcessingLogs {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public funcs: ProcessFuncs = {
		[LogType.BAN]: this.banManage.bind(this, false),
		[LogType.UNBAN]: this.banManage.bind(this, true),

		[LogType.CHANNEL_CREATE]: this.channelManage.bind(this, false),
		[LogType.CHANNEL_DELETE]: this.channelManage.bind(this, true),

		[LogType.EMOJI_CREATE]: this.emojiManage.bind(this, false),
		[LogType.EMOJI_DELETE]: this.emojiManage.bind(this, true),
		[LogType.EMOJI_UPDATE]: this.emojiUpdate.bind(this),

		[LogType.ROLE_CREATE]: this.roleManage.bind(this, false),
		[LogType.ROLE_DELETE]: this.roleManage.bind(this, true),
		[LogType.ROLE_UPDATE]: this.roleUpdate.bind(this),

		[LogType.VOICE_JOIN]: this.voiceStateChanged.bind(this, false),
		[LogType.VOICE_LEAVE]: this.voiceStateChanged.bind(this, true),
		[LogType.VOICE_SWITCH]: this.voiceUpdate.bind(this),

		[LogType.MEMBER_JOIN]: this.memberManage.bind(this, false),
		[LogType.MEMBER_LEAVE]: this.memberManage.bind(this, true),
		[LogType.MEMBER_UPDATE_ROLES]: this.memberRolesUpdate.bind(this),

		[LogType.MESSAGE_EDITED]: this.messageUpdate.bind(this),
		[LogType.MESSAGE_DELETED]: this.messageDeleted.bind(this)
	};

	private async banManage(reverse: boolean, t: TranslateFunc, guild: Guild, user: User) {
		const embed = this.client.messages.createEmbed({
			author: { name: t(reverse ? 'logs.unban' : 'logs.ban') },
			color: ColorResolve(reverse ? Color.GREEN : Color.RED),
			fields: [
				{
					name: t('logs.member'),
					value: this.nickname(user),
					inline: true
				}
			],
			thumbnail: { url: user.avatarURL },
			footer: this.footerId(user)
		});

		const entry = await this.getAuditLog(
			guild,
			user,
			reverse ? Constants.AuditLogActions.MEMBER_BAN_REMOVE : Constants.AuditLogActions.MEMBER_BAN_ADD
		);

		if (entry) {
			embed.fields.push(
				...[
					{
						name: t('logs.reason'),
						value: entry.reason || 'No reason',
						inline: true
					},
					{
						name: t('logs.by'),
						value: entry.user.mention,
						inline: true
					}
				]
			);

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}

	private async channelManage(reverse: boolean, t: TranslateFunc, guild: Guild, created: GuildChannel) {
		const embed = this.client.messages.createEmbed({
			author: { name: t(reverse ? 'logs.chanDelete' : 'logs.chanCreate') },
			color: ColorResolve(reverse ? Color.RED : Color.GREEN),
			fields: [
				{
					name: t('logs.channel'),
					value: created.mention,
					inline: true
				}
			],
			footer: this.footerId(created)
		});

		const entry = await this.getAuditLog(
			guild,
			created,
			reverse ? Constants.AuditLogActions.CHANNEL_DELETE : Constants.AuditLogActions.CHANNEL_CREATE
		);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}

	private async emojiManage(reverse: boolean, t: TranslateFunc, guild: Guild, emoji: Emoji) {
		const embed = this.client.messages.createEmbed({
			author: { name: t(reverse ? 'logs.emojiDelete' : 'logs.emojiCreate') },
			color: ColorResolve(reverse ? Color.RED : Color.GREEN),
			fields: [
				{
					name: t('logs.emoji'),
					value: this.emoji(emoji),
					inline: true
				}
			]
		});

		const entry = await this.getAuditLog(
			guild,
			emoji,
			reverse ? Constants.AuditLogActions.EMOJI_DELETE : Constants.AuditLogActions.EMOJI_CREATE
		);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}

	private async roleManage(reverse: boolean, t: TranslateFunc, guild: Guild, role: Role) {
		const embed = this.client.messages.createEmbed({
			author: { name: t(reverse ? 'logs.roleDelete' : 'logs.roleCreate') },
			color: ColorResolve(reverse ? Color.RED : Color.GREEN),
			fields: [
				{
					name: t('logs.role'),
					value: reverse ? role.name : role.mention,
					inline: true
				}
			]
		});

		const entry = await this.getAuditLog(
			guild,
			role,
			reverse ? Constants.AuditLogActions.ROLE_DELETE : Constants.AuditLogActions.ROLE_CREATE
		);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}

	private async voiceStateChanged(
		reverse: boolean,
		t: TranslateFunc,
		guild: Guild,
		member: Member,
		channel: VoiceChannel
	) {
		const embed = this.client.messages.createEmbed({
			author: { name: t(reverse ? 'logs.voiceLeaved' : 'logs.voiceConnected') },
			color: ColorResolve(reverse ? Color.RED : Color.GREEN),
			fields: [
				{
					name: t('logs.channel'),
					value: reverse ? channel.name : channel.mention,
					inline: true
				},
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}

	private async memberManage(reverse: boolean, t: TranslateFunc, guild: Guild, member: Member) {
		const embed = this.client.messages.createEmbed({
			author: { name: t(reverse ? 'logs.guildLeave' : 'logs.guildJoin') },
			color: ColorResolve(reverse ? Color.RED : Color.GREEN),
			fields: [
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}

	private async messageDeleted(t: TranslateFunc, guild: Guild, { content, member, channel }: Message) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.messageDeleted') },
			color: ColorResolve(Color.ORANGE),
			fields: [
				{
					name: t('logs.messageBefore'),
					value: content.markdown(''),
					inline: false
				},
				{
					name: t('logs.messageBy'),
					value: member.mention,
					inline: true
				},
				{
					name: t('logs.channel'),
					value: channel.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}

	private async roleUpdate(t: TranslateFunc, guild: Guild, role: Role, oldRole: Role) {
		const compares = this.compare(role, oldRole);

		if (compares.length === 1 && compares.find((x) => x.key === 'position')) {
			return;
		}

		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.roleUpdate') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.role'),
					value: role.mention,
					inline: true
				}
			]
		});

		const entry = await this.getAuditLog(guild, role, Constants.AuditLogActions.ROLE_UPDATE);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		for (const compare of compares.sort((a, b) => a.key.localeCompare(b.key))) {
			embed.fields.push({
				name: t(`logs.${compare.key}`),
				value: `\`${compare.old}\` => \`${compare.new}\``,
				inline: false
			});
		}

		const addedPermissions = Object.entries(role.permissions.json).filter(
			([key, val]) => oldRole.permissions.json[key] !== val
		);
		const deletedPermissions = Object.entries(oldRole.permissions.json).filter(
			([key, val]) => role.permissions.json[key] !== val
		);

		if (addedPermissions.length >= 1) {
			embed.fields.push({
				name: t('logs.permissionsAdded'),
				value: addedPermissions
					.map(([key, val]) => `\`${Object.entries(GuildPermission).find(([, val]) => val === key)[0]}\``)
					.join(', '),
				inline: true
			});
		}

		if (deletedPermissions.length >= 1) {
			embed.fields.push({
				name: t('logs.permissionsDeleted'),
				value: deletedPermissions
					.map(([key, val]) => `\`${Object.entries(GuildPermission).find(([, val]) => val === key)[0]}\``)
					.join(', '),
				inline: true
			});
		}

		return embed;
	}

	private async emojiUpdate(t: TranslateFunc, guild: Guild, newEmoji: Emoji, oldEmoji: Emoji) {
		const compare = this.compare(newEmoji, oldEmoji);

		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.emojiUpdate') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.emoji'),
					value: this.emoji(newEmoji),
					inline: true
				},
				{
					name: t('logs.edited'),
					value: compare.map((x) => `${x.key}: ${x.old} -> ${x.new}`).join('\n'),
					inline: true
				}
			]
		});

		const entry = await this.getAuditLog(guild, newEmoji, Constants.AuditLogActions.EMOJI_UPDATE);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}

	private async voiceUpdate(
		t: TranslateFunc,
		guild: Guild,
		member: Member,
		newChannel: VoiceChannel,
		oldChannel: VoiceChannel
	) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.voiceSwitch') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.channel'),
					value: `\`${oldChannel.name}\` -> \`${newChannel.name}\``,
					inline: true
				},
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}

	private async memberRolesUpdate(t: TranslateFunc, guild: Guild, member: Member, oldRoles: string[]) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.memberRolesUpdate') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		const entry = await this.getAuditLog(guild, member, Constants.AuditLogActions.MEMBER_ROLE_UPDATE);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		const addedRole = member.roles.find((r) => !oldRoles.includes(r));
		const deletedRole = oldRoles.find((r) => !member.roles.includes(r));

		if (addedRole) {
			embed.fields.push({
				name: t('logs.addedRoles'),
				value: `<@&${addedRole}>`,
				inline: true
			});
		}

		if (deletedRole) {
			embed.fields.push({
				name: t('logs.deletedRoles'),
				value: `<@&${deletedRole}>`,
				inline: true
			});
		}

		return embed;
	}

	private async messageUpdate(
		t: TranslateFunc,
		guild: Guild,
		{ member, content, channel }: Message,
		oldMessage: Message
	) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.messageUpdate') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.messageBefore'),
					value: oldMessage.content.markdown(''),
					inline: false
				},
				{
					name: t('logs.messageAfter'),
					value: content.markdown(''),
					inline: false
				},
				{
					name: t('logs.messageBy'),
					value: member.mention,
					inline: true
				},
				{
					name: t('logs.channel'),
					value: channel.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL }
		});

		return embed;
	}

	protected async getAuditLog(guild: Guild, user: { id: string }, type: number) {
		let me = guild.members.get(this.client.user.id) || (await guild.getRESTMember(this.client.user.id));
		const viewAudit = me.permission.has(GuildPermission.VIEW_AUDIT_LOGS);

		if (!viewAudit) return;

		const auditLogs = await guild.getAuditLogs(undefined, undefined, type);
		const auditLogEntry = auditLogs.entries.find((l) => l.targetID === user.id);

		if (auditLogEntry && auditLogEntry.user.id === this.client.user.id) {
			throw new Error('ignore');
		}

		return auditLogEntry;
	}

	protected compare(source: any, target: any) {
		return Object.entries(target)
			.map(([key, val]) => {
				if (typeof val === 'object' || typeof source[key] === 'object') return;

				if (source[key] !== val)
					return {
						key,
						old: val,
						new: source[key]
					};

				return null;
			})
			.filter((x) => !!x);
	}

	protected footerId(a: User | AnyChannel | Emoji) {
		return {
			text: `ID: ${a.id}`,
			icon_url: this.client.user.dynamicAvatarURL('png', 4096)
		};
	}

	protected nickname(user: User) {
		return `${user.username}#${user.discriminator}`;
	}

	protected emoji(emoji: Emoji) {
		return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
	}
}
