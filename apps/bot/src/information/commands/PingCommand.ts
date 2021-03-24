import { Command } from '@miko/common';
import { Message } from 'discord.js';

export class PingCommand extends Command {
	public constructor() {
		super({
			name: 'ping',
			group: 'info',
			typing: true
		});
	}

	public async execute(message: Message): Promise<void> {
		message.reply('Pong!');
	}
}
