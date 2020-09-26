import { Entity, BaseEntity, ManyToOne, JoinColumn, Column, PrimaryGeneratedColumn, createQueryBuilder } from 'typeorm';
import { BaseGuild } from './Guild';
import { Member, Guild } from 'eris';
import { Moment, Duration, duration } from 'moment';
import { DateTransformer, BigIntTransformer, DurationTransformer } from './Transformers/';
import { BaseSettings } from './GuildSettings';
import moment from 'moment';

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
	public savedRoles: string[] = [];

	@Column({ type: 'varchar', transformer: DurationTransformer })
	public voiceOnline: Duration = duration(0, 'minutes');

	@Column({ type: 'json', default: [] })
	public warns: {
		reason: string;
		createdAt: Date;
		expireAt: Date;
		moderator: string;
	}[] = [];

	public static async get(user: Member, g?: Guild) {
		const guild = g || user.guild;

		const hasFounded = await this.findOne({
			where: {
				guild: {
					id: guild.id
				},
				user: user.id
			}
		});

		if (hasFounded) return hasFounded;

		const BGuild = await BaseGuild.get(guild);
		const sets = await BaseSettings.findOne(guild.id);

		const member = BaseMember.getDefaultMember(BGuild, sets, user.id);

		return member;
	}

	private static getDefaultMember(guild: BaseGuild, sets: BaseSettings, userId: string) {
		const member = new BaseMember();
		const settings = sets ? sets : new BaseSettings();

		member.guild = guild;
		member.user = userId;
		member.money = BigInt(settings.prices.standart);

		return member;
	}

	public static async saveMembers(g: Guild, users: Member[]) {
		const guild = await BaseGuild.get(g);
		const sets = await BaseSettings.findOne(g.id);

		await createQueryBuilder()
			.insert()
			.into(this)
			.values(users.map((i) => this.getDefaultMember(guild, sets, i.id)))
			.onConflict(`("id") DO NOTHING`)
			.execute();
	}
}
