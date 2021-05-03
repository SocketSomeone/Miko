import { Column, Entity } from 'typeorm';
import { GuildEntity } from './base/GuildEntity';

@Entity({ name: 'guild_config' })
export class GuildConfig extends GuildEntity {
	@Column('varchar')
	public name!: string;

	@Column('varchar', { name: 'icon_url', nullable: true })
	public iconURL!: string;

	@Column('varchar', { default: '!' })
	public prefix = '!';

	@Column('varchar', { nullable: false, default: 'en' })
	public locale = 'en';

	public constructor(guildId: string) {
		super();

		this.guildId = guildId;
	}
}
