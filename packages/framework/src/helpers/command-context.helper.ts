import type { Guild, GuildMember, Message, User } from 'discord.js';
import type { DiscordClientProvider } from '../discord-client.provider';
import type { ICommandContext, MessageChannel } from '../interfaces';

export class CommandContext implements ICommandContext {
	public client: DiscordClientProvider;

	public guild?: Guild;

	public member?: GuildMember;

	public channel: MessageChannel;

	public user: User;

	public message: Message;

	public constructor(client: DiscordClientProvider, message: Message) {
		this.client = client;
		this.guild = message.guild;
		this.member = message.member;
		this.channel = message.channel;
		this.user = message.author;
		this.message = message;
	}
}
