import { Entity, BaseEntity, OneToMany, PrimaryColumn, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { GuildSettings, Defaults as SettingsDefaults } from '../Misc/Models/GuildSetting';
import { Permission } from '../Misc/Models/Permisson';
import { BaseMember } from './Member';

@Entity()
export class BaseGuild extends BaseEntity {
	@PrimaryColumn()
	public id: string;

	@OneToMany((type) => BaseMember, (user) => user.guild)
	@JoinColumn()
	public members: BaseMember[];

	@Column({ type: 'json', default: SettingsDefaults })
	public sets: GuildSettings;

	@Column({ type: 'json', default: [] })
	public permissions: Permission[];

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

		const guild = await this.create({
			id: guildId
		});

		return guild;
	}
}
