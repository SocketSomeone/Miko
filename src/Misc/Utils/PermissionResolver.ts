import { GuildPermission } from '../Models/GuildPermissions';

export const Permissions: { [key in GuildPermission]: number } = {
	[GuildPermission.ADMINISTRATOR]: 0x8,
	[GuildPermission.VIEW_AUDIT_LOGS]: 0x80,
	[GuildPermission.MANAGE_GUILD]: 0x20,
	[GuildPermission.MANAGE_ROLES]: 0x10000000,
	[GuildPermission.MANAGE_CHANNELS]: 0x10,
	[GuildPermission.KICK_MEMBERS]: 0x2,
	[GuildPermission.BAN_MEMBERS]: 0x4,
	[GuildPermission.CREATE_INSTANT_INVITE]: 0x1,
	[GuildPermission.CHANGE_NICKNAME]: 0x4000000,
	[GuildPermission.MANAGE_NICKNAMES]: 0x8000000,
	[GuildPermission.MANAGE_EMOJIS]: 0x40000000,
	[GuildPermission.MANAGE_WEBHOOKS]: 0x20000000,

	[GuildPermission.READ_MESSAGES]: 0x400,
	[GuildPermission.SEND_MESSAGES]: 0x800,
	[GuildPermission.SEND_TTS_MESSAGES]: 0x1000,
	[GuildPermission.MANAGE_MESSAGES]: 0x2000,
	[GuildPermission.EMBED_LINKS]: 0x4000,
	[GuildPermission.ATTACH_FILES]: 0x8000,
	[GuildPermission.READ_MESSAGE_HISTORY]: 0x10000,
	[GuildPermission.MENTIONS_EVERYONE]: 0x20000,
	[GuildPermission.USE_EXTERNAL_EMOJIS]: 0x40000,
	[GuildPermission.ADD_REACTIONS]: 0x40,

	[GuildPermission.VIEW_CHANNEL]: 0x400,
	[GuildPermission.CONNECT]: 0x100000,
	[GuildPermission.SPEAK]: 0x200000,
	[GuildPermission.MUTE_MEMBERS]: 0x400000,
	[GuildPermission.MOVE_MEMBERS]: 0x1000000,
	[GuildPermission.DEFEAN_MEMBERS]: 0x800000,
	[GuildPermission.USE_VOICE_ACTIVITY]: 0x2000000,
	[GuildPermission.USE_PRIORITY_SPEAKER]: 0x100
};

export default (...permissions: GuildPermission[]): number => {
	return permissions.reduce((acc, perm) => {
		acc += Number(Permissions[perm]);

		return acc;
	}, 0);
};
