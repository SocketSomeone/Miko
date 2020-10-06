import {
	Entity,
	BaseEntity,
	OneToMany,
	PrimaryColumn,
	JoinColumn,
	Column,
	CreateDateColumn,
	createQueryBuilder
} from 'typeorm';
import { BaseMember } from './Member';
import { BaseScheduledAction } from './ScheduledAction';
import { Guild } from 'eris';
import { BasePunishment } from './Punishment';
import { Moment } from 'moment';
import { DateTransformer } from './Transformers';

@Entity()
export class BaseGuild extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column({ type: 'varchar', default: null, nullable: true })
	public ownerID: string = null;

	@Column({ type: 'varchar', default: null, nullable: true })
	public name: string = null;

	@Column({ type: 'integer', default: 0 })
	public memberCount: number = 0;

	@OneToMany((type) => BaseMember, (user) => user.guild)
	@JoinColumn()
	public members: BaseMember[];

	@OneToMany((type) => BaseScheduledAction, (a) => a.guild)
	@JoinColumn()
	public scheduledActions: BaseScheduledAction[];

	@OneToMany((type) => BasePunishment, (a) => a.guild)
	@JoinColumn()
	public punishments: BasePunishment[];

	@CreateDateColumn({ nullable: true, transformer: DateTransformer })
	public joinedAt: Moment;

	@Column({ nullable: true, transformer: DateTransformer, type: 'timestamp without time zone' })
	public deletedAt: Moment = null;

	@Column({ type: 'varchar', nullable: true })
	public banReason: string = null;

	static async get(g: Guild, select?: (keyof BaseGuild)[]) {
		const hasFounded = await this.findOne({
			select,
			where: {
				id: g.id
			}
		});

		if (hasFounded) return hasFounded;

		return this.getDefaultGuild(g);
	}

	static async saveGuilds(guilds: Guild[], options?: Partial<BaseGuild>) {
		const items = guilds.map((i) => this.getDefaultGuild(i, options));
		const queryOptions = options
			? `, ${Object.entries(options)
					.map(([key, val]) => `"${key}" = EXCLUDED."${key}"`)
					.join(', ')}`
			: '';

		await createQueryBuilder()
			.insert()
			.into(this)
			.values(items)
			.onConflict(
				`("id") DO UPDATE SET name = excluded.name, "memberCount" = excluded."memberCount", "ownerID" = excluded."ownerID"${queryOptions}`
			)
			.execute();
	}

	static getDefaultGuild(g: Guild, options?: Partial<BaseGuild>) {
		const guild = this.create({
			...options,
			id: g.id,
			name: g.name,
			memberCount: g.memberCount,
			ownerID: g.ownerID
		});

		return guild;
	}
}
