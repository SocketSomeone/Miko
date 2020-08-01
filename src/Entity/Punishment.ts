import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseGuild } from './Guild';
import { Moment } from 'moment';
import { DateTransformer } from './Transformers';
import { Guild, Member, TextChannel } from 'eris';
import { TranslateFunc, Command } from '../Framework/Commands/Command';
import { GuildSettings } from '../Misc/Models/GuildSetting';
import { ColorResolve } from '../Misc/Utils/ColorResolver';
import { Color } from '../Misc/Enums/Colors';
import { BaseClient } from '../Client';

import i18n from 'i18n';
import { settings } from 'cluster';

export enum Punishment {
	BAN = 'ban',
	KICK = 'kick',
	softban = 'softban',
	mute = 'mute'
}

interface ContextLog {
	client: BaseClient;
	settings: GuildSettings;
	member: Member;
	target: Member;
	opts: Partial<BasePunishment>;
	extra?: { name: string; value: string }[];
}

@Entity()
export class BasePunishment extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'NO ACTION', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ nullable: true, transformer: DateTransformer, type: 'timestamp without time zone' })
	public date: Moment;

	@Column({ type: 'varchar', nullable: false })
	public type: Punishment;

	@Column({ type: 'integer' })
	public amount: number;

	@Column({ type: 'json' })
	public args: any;

	@Column({ type: 'varchar', nullable: false })
	public reason: string;

	@Column({ type: 'varchar', nullable: false })
	public member: string;

	@Column({ type: 'varchar', nullable: false })
	public moderator: string;

	@CreateDateColumn()
	public createdAt: Date;

	public static async new(ctx: ContextLog) {
		const guild = await BaseGuild.get(ctx.target.guild.id);

		const punishment = this.create({ ...ctx.opts, guild, member: ctx.target.id });

		await punishment.save();

		await this.logPunishment(ctx);
	}

	private static async logPunishment({ client, settings: sets, member, target, opts, extra }: ContextLog) {
		const t: TranslateFunc = (k, r) => i18n.__({ locale: sets.locale, phrase: k }, r);

		if (!sets.modlog) return;

		const modLogChannel = (await member.guild.channels.get(sets.modlog)) as TextChannel;

		if (!modLogChannel) return;

		extra = extra || [];

		const embed = client.messages.createEmbed(
			{
				color: ColorResolve(Color.LOGS),
				author: {
					name: `[${opts.type.toUpperCase()}] ` + t('logs.mod.title'),
					icon_url: client.user.dynamicAvatarURL('png', 4096)
				},
				fields: [
					{
						name: t('logs.mod.user'),
						value: target.user.mention,
						inline: true
					},
					{
						name: t('logs.mod.moderator'),
						value: member.user.mention,
						inline: true
					},
					...extra
						.filter((x) => !!x.value)
						.map((e) => {
							return { name: t(e.name), value: e.value.substr(0, 1024), inline: true };
						})
				],
				timestamp: new Date().toISOString(),
				footer: {
					text: null
				}
			},
			false
		);

		await client.messages.sendEmbed(modLogChannel, t, embed);
	}

	public static async informUser(
		member: Member,
		type: Punishment,
		settings: GuildSettings,
		{ reason, amount }: { reason?: string; amount?: number }
	) {
		const dmChannel = await member.user.getDMChannel();

		const t: TranslateFunc = (key, replacements) => i18n.__({ locale: settings.locale, phrase: key }, replacements);

		const fields = [
			{
				name: reason ? t(`modules.moderation.reason`) : t(`modules.moderation.amount`),
				value: reason ? reason : `${amount}`
			}
		].filter((x) => !!x.value);

		return dmChannel
			.createMessage({
				embed: {
					color: ColorResolve(Color.LOGS),
					title: t(`modules.moderation.dm.${type}`, {
						guild: member.guild.name
					}),
					fields,
					footer: {
						text: member.guild.name,
						icon_url: member.guild.dynamicIconURL('png', 4096)
					},
					timestamp: new Date().toISOString()
				}
			})
			.catch(async () => undefined);
	}
}
