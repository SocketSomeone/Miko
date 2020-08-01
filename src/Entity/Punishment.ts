import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseGuild } from './Guild';
import { Moment } from 'moment';
import { DateTransformer } from './Transformers';
import { Guild, Member } from 'eris';
import { TranslateFunc } from '../Framework/Commands/Command';
import { GuildSettings } from '../Misc/Models/GuildSetting';
import { ColorResolve } from '../Misc/Utils/ColorResolver';
import { Color } from '../Misc/Enums/Colors';

import i18n from 'i18n';

export enum Punishment {
	BAN = 'ban',
	KICK = 'kick',
	softban = 'softban',
	mute = 'mute'
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

	static async new(g: Guild, opts: Partial<BasePunishment>) {
		const guild = await BaseGuild.get(g.id);

		const punishment = this.create({ ...opts, guild });

		await punishment.save();
	}

	static async informUser(
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
					color: ColorResolve(Color.PEACH),
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
