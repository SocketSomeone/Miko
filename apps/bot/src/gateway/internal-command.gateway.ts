import { DiscordClientProvider, CommandService, On, CommandContext, DiscordEntityAccessor } from '@miko/framework';
import { Injectable } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
export class InternalCommandGateway {
	public constructor(
		private client: DiscordClientProvider,
		private commands: CommandService,
		private entityAccessor: DiscordEntityAccessor
	) {}

	@On('message')
	public async onMessage(message: Message): Promise<void> {
		if (message.partial) await message.fetch();

		await this.handleCommand(message);
	}

	@On('messageUpdate')
	public async onMessageUpdate(beforeMessage: Message, afterMessage: Message): Promise<void> {
		if (beforeMessage.partial) await beforeMessage.fetch();
		if (afterMessage.partial) await afterMessage.fetch();

		if (beforeMessage.content === afterMessage.content) return;

		await this.handleCommand(afterMessage);
	}

	public async handleCommand(message: Message): Promise<void> {
		if (
			message.author.id === this.client.user?.id ||
			message.author.bot ||
			message.webhookID ||
			!message.content.length
		)
			return;

		if (message.guild && !message.member) {
			await message.guild.members.fetch(message.author);
		}

		const guildConfig = await this.entityAccessor.getConfig(message.guild);

		const mentions = [`<@${this.client.user?.id}>`, `<@!${this.client.user?.id}>`];
		const prefixes = [...mentions, guildConfig.prefix];

		const parses = prefixes.map(prefix => this.parseWithPrefix(message, prefix));
		const parsed = parses.find(parsed => parsed !== null);

		if (!parsed) {
			return;
		}

		const context = new CommandContext(this.client, message);

		await this.commands.execute(context, parsed);
	}

	private parseWithPrefix(message: Message, prefix: string): number {
		const lowerContent = message.content.trim().toLowerCase();

		if (!lowerContent.startsWith(prefix.toLowerCase())) {
			return null;
		}

		const endOfPrefix = lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
		const startOfArgs = lowerContent.slice(endOfPrefix).search(/\S/) + prefix.length;

		return startOfArgs;
	}
}
