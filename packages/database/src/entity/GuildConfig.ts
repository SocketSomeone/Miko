import { Column, Entity } from 'typeorm';
import { GuildEntity } from './base/GuildEntity';

@Entity({ name: 'guild_config' })
export class GuildConfig extends GuildEntity {
	@Column('varchar')
	public name!: string;

	@Column('varchar', { name: 'icon_url' })
	public iconURL!: string;

	@Column('varchar')
	public prefix = '!';

	@Column('varchar', { nullable: false })
	public locale = 'en';

	public constructor(guildId: string) {
		super();

		this.guildId = guildId;
	}
}
