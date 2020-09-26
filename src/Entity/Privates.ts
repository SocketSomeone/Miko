import { BaseEntity, Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { SetTransformer } from './Transformers/SetTransformer';
import { ExecuteError } from '../Framework/Errors/ExecuteError';
import { TranslateFunc } from '../Framework/Services/Commands/Command';
import { Member, VoiceChannel, Permission, Role, Guild, Collection, PermissionOverwrite } from 'eris';
import { GuildPermission } from '../Misc/Models/GuildPermissions';
import { Permissions } from '../Misc/Utils/PermissionResolver';
import { reverse } from 'dns';
import { ChannelOptions } from '../Types';

export enum ActionRoom {
	LOCK = 'locked',
	HIDE = 'hidden'
}

@Entity()
export class BasePrivate extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column({ type: 'bigint' })
	public guild: string;

	@Column({ type: 'bigint' })
	public owner: string;

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	private admins: Set<string> = new Set();

	private isOwner = (user: string) => this.owner === user;

	public isAdmin = (user: string) => this.isOwner(user) || this.admins.has(user);

	public async actionRoom(
		t: TranslateFunc,
		{ id, guild }: Member,
		target: Member | Role | Guild,
		action: ActionRoom,
		reverse: boolean
	) {
		if (!this.isAdmin(id)) throw new ExecuteError(t('voice.error.notAdmin'));

		const channel = guild.channels.get(this.id) as VoiceChannel;
		const permissions = channel.permissionOverwrites.get(target.id) || new PermissionOverwrite({ allow: 0, deny: 0 });

		let allow: number, deny: number, json: GuildPermission;

		switch (action) {
			case ActionRoom.LOCK: {
				allow = reverse ? permissions.allow | Permissions.voiceConnect : permissions.allow & ~Permissions.voiceConnect;
				deny = reverse ? permissions.deny & ~Permissions.voiceConnect : permissions.deny | Permissions.voiceConnect;
				json = GuildPermission.CONNECT;

				break;
			}

			case ActionRoom.HIDE: {
				allow = reverse ? permissions.allow | Permissions.readMessages : permissions.allow & ~Permissions.readMessages;
				deny = reverse ? permissions.deny & ~Permissions.readMessages : permissions.deny | Permissions.readMessages;
				json = GuildPermission.VIEW_CHANNEL;

				break;
			}
		}

		const already = permissions.json[json] === reverse;

		if (already) throw new ExecuteError(t(`voice.error.${reverse ? 'un' : ''}${action.toString()}`));

		await channel.editPermission(target.id, allow, deny, target instanceof Member ? 'member' : 'role');
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

	public async kickUser(t: TranslateFunc, user: Member, target: Member) {
		if (!this.isAdmin(user.id)) throw new ExecuteError(t('voice.error.notAdmin'));

		if (user.id === target.id) throw new ExecuteError(t('voice.error.similar'));

		if (target.voiceState.channelID !== this.id)
			throw new ExecuteError(
				t('voice.error.notInRoom', {
					member: target.mention
				})
			);

		await target
			.edit({
				channelID: null
			})
			.catch((err) => {
				throw new ExecuteError(t('voice.error.invalid'));
			});
	}

	public async setOwner(t: TranslateFunc, user: Member, target: Member) {
		if (!this.isOwner(user.id)) throw new ExecuteError(t('voice.error.notOwner'));

		if (user.id === target.id) throw new ExecuteError(t('voice.error.similar'));

		const channel = user.guild.channels.get(this.id) as VoiceChannel;

		await channel.deletePermission(user.id);
		await channel.editPermission(target.id, 3147024, 0, 'member');

		this.owner = target.id;
		await this.save();
	}

	public async edit(t: TranslateFunc, { guild, id }: Member, options: ChannelOptions) {
		if (!this.isAdmin(id)) throw new ExecuteError(t('voice.error.notAdmin'));

		const channel = guild.channels.get(this.id) as VoiceChannel;

		await channel.edit(options);
	}
}
