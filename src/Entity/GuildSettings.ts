import { BaseEntity, Entity, Column, PrimaryColumn } from 'typeorm';
import { Permission } from '../Misc/Models/Permisson';
import { PermissionTransformer } from './Transformers';
import { Lang } from '../Misc/Enums/Languages';
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
	public prefix: string = '!';

	@Column({ type: 'varchar' })
	public locale: Lang = Lang.ru;

	@Column({
		type: 'json',
		default: [],
		transformer: PermissionTransformer
	})
	public permissions: Permission[] = [];

	@Column((type) => ModerationSettings)
	public moderation: ModerationSettings = new ModerationSettings();

	@Column((type) => PrivateSettings)
	public private: PrivateSettings = new PrivateSettings();

	@Column((type) => EconomySettings)
	public economy: EconomySettings = new EconomySettings();

	@Column((type) => AutomodSettings)
	public autoMod: AutomodSettings = new AutomodSettings();

	@Column((type) => WelcomeSettings)
	public welcome: WelcomeSettings = new WelcomeSettings();

	@Column((type) => LoggerSettings)
	public logger: LoggerSettings = new LoggerSettings();
}
