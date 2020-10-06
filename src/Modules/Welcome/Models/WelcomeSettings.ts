import { Column } from 'typeorm';
import { SetTransformer } from '../../../Entity/Transformers';
import { WelcomeChannelType } from '../../../Misc/Enums/WelcomeTypes';

export class WelcomeSettings {
	@Column({ type: 'boolean', default: false })
	public enabled: boolean = false;

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	public roles: Set<string> = new Set();

	@Column({ type: 'boolean', default: false })
	public saveRoles: boolean = false;

	@Column({ type: 'integer', default: null, nullable: true })
	public channelType: WelcomeChannelType = null;

	@Column({ type: 'bigint', default: null, nullable: true })
	public channel: string = null;

	@Column({ type: 'varchar', default: null, nullable: true })
	public message: string = null;
}
