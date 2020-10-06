import { Column } from 'typeorm';

export class PrivateSettings {
	@Column({ type: 'varchar', default: null, nullable: true })
	public manager: string = null;
}
