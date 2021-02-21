import { Message } from 'discord.js';
import { Logger } from 'tslog';
import { singleton } from 'tsyringe';
import { MiClient } from '../client';
import { MiCommand } from './command';
import { Throttler } from './services/throttler';

interface IParsedCommandData {
	afterPrefix?: string;
	alias?: string;
	command?: MiCommand;
	content?: string;
	prefix?: string;
}

@singleton()
export class CommandService {
	private commands: Map<string, MiCommand> = new Map();

	private logger: Logger = new Logger({ name: 'CommandHandler' });

	public constructor(private readonly client: MiClient, private readonly throttler: Throttler) {
		this.client.on('message', async message => {
			if (message.partial) await message.fetch();

			this.handle(message);
		});

		this.client.on('messageUpdate', async (before, after) => {
			if (before.partial) await before.fetch();
			if (after.partial) await after.fetch();

			if (after.content === before.content) return;
			this.handle(after as Message);
		});
	}

	public register(command: MiCommand): void {
		const conflict = this.commands.get(command.name.toLowerCase());

		if (conflict) {
			this.logger.error(`Command ${command.name} already exists!`);
			process.exit(1);
		}

		this.commands.set(command.name.toLowerCase(), command);
		this.logger.debug('Added new command');
	}

	private async handle(message: Message): Promise<boolean | void> {
		try {
			if (message.author.id === this.client.user?.id || message.author.bot || !message.content.length) {
				return false;
			}

			const parsed = await this.parseCommand(message);

			if (!parsed.command) {
				return false;
			}

			return this.handleCommand(message, parsed.command);
		} catch (err) {
			this.logger.error('Error caused in handle command', err);
			return false;
		}
	}

	private async handleCommand(message: Message, command: MiCommand): Promise<void> {
		return this.runCommand(message, command);
	}

	private async runCommand(message: Message, command: MiCommand): Promise<void> {
		message.channel.startTyping();

		try {
			await command.execute(message);
		} finally {
			message.channel.stopTyping();
		}
	}

	private async parseCommand(message: Message): Promise<IParsedCommandData> {
		const mentions = [`<@${this.client.user?.id}>`, `<@!${this.client.user?.id}>`];
		const prefixes = [...mentions, await this.prefix()];

		const parses = prefixes.map(prefix => this.parseWithPrefix(message, prefix));
		const result = parses.find(parsed => parsed.command);

		if (result) {
			return result;
		}

		return {};
	}

	// TODO: CUSTOM SETTING
	private async prefix(): Promise<string> {
		return '!';
	}

	private parseWithPrefix(message: Message, prefix: string): IParsedCommandData {
		const lowerContent = message.content.toLowerCase();

		if (!lowerContent.startsWith(prefix.toLowerCase())) {
			return {};
		}

		const endOfPrefix = lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
		const startOfArgs = message.content.slice(endOfPrefix).search(/\S/) + prefix.length;
		const alias = message.content.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0];
		const command = this.commands.get(alias);
		const content = message.content.slice(startOfArgs + alias.length + 1).trim();
		const afterPrefix = message.content.slice(prefix.length).trim();

		if (!command) {
			return { prefix, alias, content, afterPrefix };
		}

		return { command, prefix, alias, content, afterPrefix };
	}
}
