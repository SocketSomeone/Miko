import type { DMChannel, Guild, GuildMember, Message, NewsChannel, TextChannel, User } from 'discord.js';
import type { DiscordClientProvider } from '../discord-client.provider';

export type MessageChannel = TextChannel | DMChannel | NewsChannel;

export interface ICommandContext {
	client: DiscordClientProvider;
	message: Message;
	guild?: Guild;
	member?: GuildMember;
	user: User;
	channel: MessageChannel;
}
