import { Column } from 'typeorm';
import { BigIntTransformer } from '../../../Entity/Transformers';

export class PrivateSettings {
	@Column({ type: 'bigint', default: null, nullable: true })
	public manager: string = null;
}
