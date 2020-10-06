import { BaseEntity, Entity, Column, PrimaryColumn } from 'typeorm';
import { EmojisDefault } from '../Misc/Enums/EmojisDefaults';
import { PunishmentConfig, Violation } from '../Misc/Enums/Violation';
import { SetTransformer } from './Transformers/SetTransformer';
import { Permission } from '../Misc/Models/Permisson';
import { PermissionTransformer } from './Transformers';
import { Lang } from '../Misc/Enums/Languages';
import { WelcomeSettings } from '../Modules/Welcome/Models/WelcomeSettings';
import { LoggerSettings } from '../Modules/Log/Models/LoggerSettings';
import { AutomodSettings } from '../Modules/Moderation/Models/AutomodSettings';
import { EconomySettings } from '../Modules/Economy/Models/EconomySettings';
import { PrivateSettings } from '../Modules/Voice/Models/PrivateSettings';
import { ModerationSettings } from '../Modules/Moderation/Models/ModerationSettings';

interface GuildPrices {
	timely: string;
	standart: string;
}

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
	public moderation: ModerationSettings;

	@Column((type) => PrivateSettings)
	public private: PrivateSettings;

	@Column((type) => EconomySettings)
	public economy: EconomySettings;

	@Column((type) => AutomodSettings)
	public autoMod: AutomodSettings;

	@Column((type) => WelcomeSettings)
	public welcome: WelcomeSettings;

	@Column((type) => LoggerSettings)
	public logger: LoggerSettings;
}
