import { BaseEntity, Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { SetTransformer } from './Transformers/SetTransformer';
import { ExecuteError } from '../Framework/Errors/ExecuteError';
import { TranslateFunc } from '../Framework/Commands/Command';
import { Member, VoiceChannel, Permission } from 'eris';
import { GuildPermission } from '../Misc/Models/GuildPermissions';
import { Permissions } from '../Misc/Utils/PermissionResolver';

@Entity()
export class BasePrivate extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column()
	public owner: string;

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	private admins: Set<string> = new Set();

	@Column({ type: 'boolean', default: false })
	public isLocked: boolean = false;

	@Column({ type: 'boolean', default: false })
	public isHidden: boolean = false;

	@CreateDateColumn()
	private createdAt: Date;

	public isOwner(user: string) {
		return this.owner === user;
	}

	public isAdmin(user: string) {
		return this.isOwner(user) || this.admins.has(user);
	}

	public async lockRoom(t: TranslateFunc, { id, guild }: Member) {
		if (!this.isAdmin(id)) throw new ExecuteError(t('voice.error.notAdmin'));

		const channel = guild.channels.get(this.id) as VoiceChannel;
		const permissions = channel.permissionOverwrites.get(guild.id);
		const isLocked = permissions.json[GuildPermission.CONNECT] === false;

		if (isLocked) throw new ExecuteError(t('voice.error.locked'));

		await channel.editPermission(
			guild.id,
			permissions.allow & ~Permissions.voiceConnect,
			permissions.deny | Permissions.voiceConnect,
			'role'
		);
	}

	public async unlockRoom(t: TranslateFunc, { id, guild }: Member) {
		if (!this.isAdmin(id)) throw new ExecuteError(t('voice.error.notAdmin'));

		const channel = guild.channels.get(this.id) as VoiceChannel;
		const permissions = channel.permissionOverwrites.get(guild.id);
		const isUnlocked = permissions.json[GuildPermission.CONNECT] === true;

		if (isUnlocked) throw new ExecuteError(t('voice.error.unlocked'));

		await channel.editPermission(
			guild.id,
			permissions.allow | Permissions.voiceConnect,
			permissions.deny & ~Permissions.voiceConnect,
			'role'
		);
	}

	public async hideRoom(t: TranslateFunc, { id, guild }: Member) {
		if (!this.isAdmin(id)) throw new ExecuteError(t('voice.error.notAdmin'));

		const channel = guild.channels.get(this.id) as VoiceChannel;
		const permissions = channel.permissionOverwrites.get(guild.id);
		const isHidden = permissions.json[GuildPermission.VIEW_CHANNEL] === false;

		if (isHidden) throw new ExecuteError(t('voice.error.hidden'));

		await channel.editPermission(
			guild.id,
			permissions.allow & ~Permissions.readMessages,
			permissions.deny | Permissions.readMessages,
			'role'
		);
	}

	public async unhideRoom(t: TranslateFunc, { id, guild }: Member) {
		if (!this.isAdmin(id)) throw new ExecuteError(t('voice.error.notAdmin'));

		const channel = guild.channels.get(this.id) as VoiceChannel;
		const permissions = channel.permissionOverwrites.get(guild.id);
		const isShowed = permissions.json[GuildPermission.VIEW_CHANNEL] === true;

		if (isShowed) throw new ExecuteError(t('voice.error.unhidden'));

		await channel.editPermission(
			guild.id,
			permissions.allow | Permissions.readMessages,
			permissions.deny & ~Permissions.readMessages,
			'role'
		);
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
