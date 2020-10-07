import { Column } from 'typeorm';
import { BigIntTransformer } from '../../../Entity/Transformers';
import { EmojisDefault } from '../../../Misc/Enums/EmojisDefaults';

export class EconomySettings {
	@Column({ type: 'varchar', default: EmojisDefault.WALLET })
	public currency: string = EmojisDefault.WALLET;

	@Column({ type: 'bigint', transformer: BigIntTransformer, default: 50 })
	public timely: bigint = 50n;

	@Column({ type: 'bigint', transformer: BigIntTransformer, default: 150 })
	public standart: bigint = 150n;
}
