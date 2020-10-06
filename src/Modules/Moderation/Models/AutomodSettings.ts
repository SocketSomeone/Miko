import { Column } from 'typeorm';
import { SetTransformer } from '../../../Entity/Transformers';
import { PunishmentConfig, Violation } from '../../../Misc/Enums/Violation';

export class AutomodSettings {
	@Column({
		type: 'json',
		default: {}
	})
	public violations: {
		[key in Violation]?: boolean;
	} = {};

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	public ignoreRoles: Set<string> = new Set();

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	public ignoreChannels: Set<string> = new Set();

	@Column({ type: 'json', default: [] })
	public config: PunishmentConfig[] = [];
}
