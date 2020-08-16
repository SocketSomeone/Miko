export enum GuildPermission {
	//GUILD PERMISSIONS

	ADMINISTRATOR = 'administrator',
	VIEW_AUDIT_LOGS = 'viewAuditLogs',
	MANAGE_GUILD = 'manageGuild',
	MANAGE_CHANNELS = 'manageChannels',
	MANAGE_ROLES = 'manageRoles',
	BAN_MEMBERS = 'banMembers',
	KICK_MEMBERS = 'kickMembers',
	CREATE_INSTANT_INVITE = 'createInstantInvite',
	CHANGE_NICKNAME = 'changeNickname',
	MANAGE_NICKNAMES = 'manageNicknames',
	MANAGE_EMOJIS = 'manageEmojis',
	MANAGE_WEBHOOKS = 'manageWebhooks',

	// TEXT PERMISSIONS

	READ_MESSAGES = 'readMessages',
	SEND_MESSAGES = 'sendMessages',
	SEND_TTS_MESSAGES = 'sendTTSMessages',
	MANAGE_MESSAGES = 'manageMessages',
	EMBED_LINKS = 'embedLinks',
	ATTACH_FILES = 'attachFiles',
	READ_MESSAGE_HISTORY = 'readMessageHistory',
	MENTIONS_EVERYONE = 'mentionEveryone',
	USE_EXTERNAL_EMOJIS = 'externalEmojis',
	ADD_REACTIONS = 'addReactions',

	//VOICE PERMISSIONS

	VIEW_CHANNEL = 'readMessages',
	CONNECT = 'voiceConnect',
	MUTE_MEMBERS = 'voiceMuteMembers',
	DEFEAN_MEMBERS = 'voiceDeafenMembers',
	MOVE_MEMBERS = 'voiceMoveMembers',
	SPEAK = 'voiceSpeak',
	USE_VOICE_ACTIVITY = 'voiceUseVAD',
	USE_PRIORITY_SPEAKER = 'voicePrioritySpeaker'
}
