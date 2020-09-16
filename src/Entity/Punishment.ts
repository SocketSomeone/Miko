import {
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	PrimaryColumn,
	BeforeInsert
} from 'typeorm';
import { BaseGuild } from './Guild';
import { Moment } from 'moment';
import { DateTransformer } from './Transformers';
import { Guild, Member, TextChannel } from 'eris';
import { TranslateFunc, Command } from '../Framework/Commands/Command';
import { ColorResolve } from '../Misc/Utils/ColorResolver';
import { Color } from '../Misc/Enums/Colors';
import { BaseClient } from '../Client';
import { BaseSettings } from './GuildSettings';
import i18n from 'i18n';

export enum Punishment {
	BAN = 'ban',
	KICK = 'kick',
	SOFTBAN = 'softban',
	MUTE = 'mute',
	IGNORE = 'ignore'
}

interface ContextLog {
	client: BaseClient;
	settings: BaseSettings;
	member: Member;
	target: Member;
	opts?: Partial<BasePunishment>;
	type?: Punishment | string;
	extra?: { name: string; value: string }[];
}

@Entity()
export class BasePunishment extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'bigint' })
	public id: bigint;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'NO ACTION', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ nullable: true, transformer: DateTransformer, type: 'timestamp without time zone' })
	public date: Moment;

	@Column({ type: 'varchar', nullable: false })
	public type: Punishment;

	@Column({ type: 'json' })
	public args: any;

	@Column({ type: 'varchar', nullable: false })
	public reason: string;

	@Column({ type: 'bigint', nullable: false })
	public member: string;

	@Column({ type: 'bigint', nullable: false })
	public moderator: string;

	@CreateDateColumn()
	public createdAt: Date;

	public static async new({ opts, member, target, client, settings, extra }: ContextLog) {
		const t: TranslateFunc = (key, replacements) => i18n.__({ locale: settings.locale, phrase: key }, replacements);

		await this.create({
			...opts,
			guild: BaseGuild.create({ id: member.guild.id }),
			member: target.id
		}).save();

		await client.logger.logModAction({
			sets: settings,
			type: opts.type,
			member,
			target,
			extra,
			t
		});
	}

	public static async informUser(
		t: TranslateFunc,
		member: Member,
		type: Punishment,
		extra?: { name: string; value: string }[]
	) {
		const dmChannel = await member.user.getDMChannel();

		const fields = extra
			.filter((x) => !!x.value)
			.map((e) => {
				return { name: t(e.name), value: e.value.substr(0, 1024), inline: true };
			});

		return dmChannel
			.createMessage({
				embed: {
					color: ColorResolve(Color.DARK),
					author: {
						name: t(`moderation.dm.${type}`, {
							guild: member.guild.name
						}),
						icon_url: member.guild.iconURL
					},
					footer: {
						text: member.guild.name,
						icon_url: member.guild.dynamicIconURL('png', 4096)
					},
					fields,
					timestamp: new Date().toISOString()
				}
			})
			.catch(async () => undefined);
	}
}
