import { Column, Entity } from 'typeorm';
import { BaseGuildEntity } from './base/GuildEntity';

@Entity({ name: 'guild_config' })
export class GuildConfig extends BaseGuildEntity {
	@Column('varchar')
	public name!: string;

	@Column('varchar', { name: 'icon_url', nullable: true })
	public iconURL!: string;

	@Column('varchar', { default: '!' })
	public prefix = '!';

	@Column('varchar', { nullable: false, default: 'en' })
	public locale = 'en';
}
