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

@Entity()
export class BaseGuild extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column({ type: 'varchar', default: null, nullable: true })
	public ownerID: string;

	@Column({ type: 'varchar', default: null, nullable: true })
	public name: string = 'Unknown Server';

	@Column({ type: 'integer', default: 0, name: 'size' })
	public size: number = 0;

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

	@CreateDateColumn()
	public joinedAt: Date;

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

	static async saveGuilds(guilds: Guild[]) {
		const items = guilds.map((i) => this.getDefaultGuild(i));

		await createQueryBuilder()
			.insert()
			.into(this)
			.values(items)
			.onConflict(`("id") DO UPDATE SET name = excluded.name, size = excluded.size`)
			.execute();
	}

	static getDefaultGuild(g: Guild) {
		const guild = this.create({
			id: g.id,
			name: g.name,
			size: g.memberCount,
			ownerID: g.ownerID,
			permissions: [],
			punishmentConfig: []
		});

		return guild;
	}
}
