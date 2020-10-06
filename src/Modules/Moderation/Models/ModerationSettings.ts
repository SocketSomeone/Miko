import { Column } from 'typeorm';

export class ModerationSettings {
	@Column({ type: 'varchar', default: null, nullable: true })
	public muteRole: string = null;
}
