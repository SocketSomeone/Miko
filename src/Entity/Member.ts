import { Entity, BaseEntity, ManyToOne, JoinColumn, Column, PrimaryGeneratedColumn, createQueryBuilder } from 'typeorm';
import { BaseGuild } from './Guild';
import { Member, Guild } from 'eris';
import { Moment, Duration, duration } from 'moment';
import { DateTransformer, BigIntTransformer, DurationTransformer } from './Transformers/';
import { BaseSettings } from './GuildSettings';

@Entity()
export class BaseMember extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ nullable: false, type: 'bigint' })
	public user: string;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'CASCADE', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ type: 'bigint', default: 0n, transformer: BigIntTransformer })
	public money: bigint;

	@Column({
		type: 'timestamp without time zone',
		nullable: true,
		transformer: DateTransformer
	})
	public timelyAt: Moment;

	@Column({ type: 'varchar', default: {}, array: true })
	public savedRoles: string[];

	@Column({ type: 'varchar', transformer: DurationTransformer })
	public voiceOnline: Duration;

	@Column({ type: 'json', default: [] })
	public warns: {
		reason: string;
		createdAt: Date;
		expireAt: Date;
		moderator: string;
	}[];

	public static async get(user: Member) {
		const hasFounded = await this.findOne({
			where: {
				guild: {
					id: user.guild.id
				},
				user: user.id
			}
		});

		if (hasFounded) return hasFounded;

		const guild = await BaseGuild.get(user.guild.id);
		const sets = await BaseSettings.findOne(user.guild.id);

		const member = BaseMember.getDefaultMember(guild, sets, user.id);

		await member.save();

		return member;
	}

	private static getDefaultMember(guild: BaseGuild, sets: BaseSettings, userId: string) {
		const member = new BaseMember();
		const settings = sets ? sets : new BaseSettings();

		member.guild = guild;
		member.user = userId;
		member.voiceOnline = duration(0, 'minutes');
		member.money = BigInt(settings.prices.standart);

		return member;
	}

	public static async saveMembers(g: Guild, users: Member[]) {
		const guild = await BaseGuild.get(g.id);
		const sets = await BaseSettings.findOne(g.id);

		await createQueryBuilder()
			.insert()
			.into(this)
			.values(users.map((i) => this.getDefaultMember(guild, sets, i.id)))
			.onConflict(`("id") DO NOTHING`)
			.execute();
	}
}
