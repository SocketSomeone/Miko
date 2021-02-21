import { MiCommand, StringResolver } from '@miko/common';
import { injectable } from 'tsyringe';
import { Message } from 'discord.js';

@injectable()
export class HelloCommand extends MiCommand {
	public constructor() {
		super({
			name: 'hello',
			group: 'info',
			arguments: [{ name: 'word', resolver: StringResolver }]
		});
	}

	public async execute(message: Message, [word]: [string]): Promise<void> {
		message.reply(`Hello, ${word}`);
	}
}
