import { Entity, BaseEntity, OneToMany, PrimaryColumn, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { Member } from './Member';
import { GuildSettings, Defaults as SettingsDefaults } from '../Misc/Models/GuildSetting';
import { Permission } from '../Misc/Models/Permisson';

@Entity()
export class Guild extends BaseEntity {
	@PrimaryColumn()
	public id: string;

	@OneToMany((type) => Member, (user) => user.guild)
	@JoinColumn()
	public members: Member[];

	@Column({ type: 'json', default: SettingsDefaults })
	public sets: GuildSettings;

	@Column({ type: 'json', default: [] })
	public permissions: Permission[];

	@Column()
	public membersCount: number;

	@CreateDateColumn()
	public joinedAt: Date;
}
