import {
	Entity,
	BaseEntity,
	OneToMany,
	PrimaryColumn,
	JoinColumn,
	Column,
	CreateDateColumn,
	createQueryBuilder,
	OneToOne
} from 'typeorm';
import { Permission } from '../Misc/Models/Permisson';
import { BaseMember } from './Member';
import { BaseScheduledAction } from './ScheduledAction';
import { Guild } from 'eris';
import { BasePunishment } from './Punishment';
import { PunishmentConfig } from '../Misc/Enums/Violation';
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

	@Column({ type: 'json', default: [] })
	public permissions: Permission[] = [];

	@Column({ type: 'json', default: [] })
	public punishmentConfig: PunishmentConfig[] = [];

	@Column({ nullable: true, transformer: DateTransformer, type: 'timestamp without time zone' })
	public joinedAt: Moment = null;

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

		const guild = this.getDefaultGuild(g);

		await guild.save();

		return guild;
	}

	static async saveGuilds(guilds: Guild[], options?: Partial<BaseGuild>) {
		const items = guilds.map((i) => this.getDefaultGuild(i, options));
		const queryOptions = options
			? `${Object.entries(options)
					.map(([key, val]) => `"${key}" = EXCLUDED."${key}"`)
					.join(', ')},`
			: '';

		await createQueryBuilder()
			.insert()
			.into(this)
			.values(items)
			.onConflict(
				`("id") DO UPDATE SET ${queryOptions} name = excluded.name, "memberCount" = excluded."memberCount", "ownerID" = excluded."ownerID"`
			)
			.execute();
	}

	static getDefaultGuild(g: Guild, options?: Partial<BaseGuild>) {
		const guild = this.create({
			id: g.id,
			name: g.name,
			memberCount: g.memberCount,
			ownerID: g.ownerID,
			permissions: [],
			punishmentConfig: [],
			...options
		});

		return guild;
	}
}
