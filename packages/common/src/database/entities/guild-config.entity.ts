import { Column, Entity } from 'typeorm';
import { BaseGuildEntity } from './base/guild.base';

@Entity({ name: 'guild_config' })
export class GuildConfig extends BaseGuildEntity {
	@Column('varchar', { length: 100, nullable: true })
	public name!: string;

	@Column('varchar', { name: 'icon_url', nullable: true })
	public iconURL!: string;

	@Column('varchar', { default: '!' })
	public prefix = '!';

	@Column('varchar', { nullable: false, default: 'en' })
	public locale = 'en';
}
