import { Command, StringResolver } from '@miko/common';
import { Message } from 'discord.js';

export class HelloCommand extends Command {
	public constructor() {
		super({
			name: 'hello',
			group: 'info',
			arguments: [{ name: 'word', resolver: StringResolver, optional: true }]
		});
	}

	public async execute(message: Message, [word]: [string]): Promise<void> {
		message.reply(`Hello, ${word}`);
	}
}
