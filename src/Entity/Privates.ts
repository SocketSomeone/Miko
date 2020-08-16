import { BaseEntity, Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { SetTransformer } from './Transformers/SetTransformer';
import { ExecuteError } from '../Framework/Errors/ExecuteError';
import { TranslateFunc } from '../Framework/Commands/Command';
import { Member, VoiceChannel } from 'eris';

@Entity()
export class BasePrivate extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column()
	public owner: string;

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	private admins: Set<string> = new Set();

	@CreateDateColumn()
	private createdAt: Date;

	public isOwner(user: string) {
		return this.owner === user;
	}

	public isAdmin(user: string) {
		return this.isOwner(user) || this.admins.has(user);
	}

	public async actionAdmin(t: TranslateFunc, user: Member, target: Member) {
		if (!this.isOwner(user.id)) throw new ExecuteError(t('voice.error.notOwner'));

		if (user.id === target.id) throw new ExecuteError(t('voice.error.similar'));

		const channel = user.guild.channels.get(this.id) as VoiceChannel;

		if (this.isAdmin(target.id)) {
			this.admins.delete(target.id);

			await channel.deletePermission(target.id);
		} else {
			this.admins.add(target.id);

			await channel.editPermission(target.id, 3147024, 0, 'member');
		}

		await this.save();

		return this.isAdmin(target.id);
	}
}
