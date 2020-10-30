import { BaseEntity, Entity, Column, PrimaryColumn } from 'typeorm';
import { WelcomeSettings } from '../Modules/Welcome/Models/WelcomeSettings';
import { LoggerSettings } from '../Modules/Log/Models/LoggerSettings';
import { AutomodSettings } from '../Modules/Moderation/Models/AutomodSettings';
import { EconomySettings } from '../Modules/Economy/Models/EconomySettings';
import { PrivateSettings } from '../Modules/Voice/Models/PrivateSettings';
import { ModerationSettings } from '../Modules/Moderation/Models/ModerationSettings';

@Entity()
export class BaseSettings extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column({ type: 'varchar', default: '!' })
	public prefix = '!';

	@Column({ type: 'varchar' })
	public locale: 'ru' | 'en' = 'ru';

	@Column({ type: 'integer', default: 0 })
	public deleteMessageAfter = 0;

	@Column((type) => ModerationSettings)
	public moderation = new ModerationSettings();

	@Column((type) => PrivateSettings)
	public private = new PrivateSettings();

	@Column((type) => EconomySettings)
	public economy = new EconomySettings();

	@Column((type) => AutomodSettings)
	public autoMod = new AutomodSettings();

	@Column((type) => WelcomeSettings)
	public welcome = new WelcomeSettings();

	@Column((type) => LoggerSettings)
	public logger = new LoggerSettings();
}
