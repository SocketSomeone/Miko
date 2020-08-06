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
import { GuildSettings, Defaults as SettingsDefaults } from '../Misc/Models/GuildSetting';
import { Permission } from '../Misc/Models/Permisson';
import { BaseMember } from './Member';
import { BaseScheduledAction } from './ScheduledAction';
import { Guild } from 'eris';
import { BasePunishment } from './Punishment';
import { PunishmentConfig } from '../Misc/Models/Violation';

@Entity()
export class BaseGuild extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@OneToMany((type) => BaseMember, (user) => user.guild)
	@JoinColumn()
	public members: BaseMember[];

	@OneToMany((type) => BaseScheduledAction, (a) => a.guild)
	@JoinColumn()
	public scheduledActions: BaseScheduledAction[];

	@OneToMany((type) => BasePunishment, (a) => a.guild)
	@JoinColumn()
	public punishments: BasePunishment[];

	@Column({ type: 'json', default: SettingsDefaults })
	public sets: GuildSettings;

	@Column({ type: 'json', default: [] })
	public permissions: Permission[];

	@Column({ type: 'json', default: [] })
	public punishmentConfig: PunishmentConfig[];

	@CreateDateColumn()
	public joinedAt: Date;

	static async get(guildId: string, select?: (keyof BaseGuild)[]) {
		const hasFounded = await this.findOne({
			select,
			where: {
				id: guildId
			}
		});

		if (hasFounded) return hasFounded;

		const guild = this.getDefaultGuild(guildId);

		await guild.save();

		return guild;
	}

	static async saveGuilds(guilds: Guild[]) {
		await createQueryBuilder()
			.insert()
			.into(this)
			.values(guilds.map((i) => this.getDefaultGuild(i.id)))
			.onConflict(`("id") DO NOTHING`)
			.execute();
	}

	static getDefaultGuild(guildId: string) {
		const guild = this.create({
			id: guildId,
			sets: SettingsDefaults,
			permissions: [],
			punishmentConfig: []
		});

		return guild;
	}
}
