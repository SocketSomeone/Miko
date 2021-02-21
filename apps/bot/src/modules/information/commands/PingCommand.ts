import { MiCommand } from '@miko/common';
import { injectable } from 'tsyringe';
import { Message } from 'discord.js';

@injectable()
export class PingCommand extends MiCommand {
	public constructor() {
		super({
			name: 'ping',
			group: 'info'
		});
	}

	public async execute(message: Message): Promise<void> {
		message.reply('Pong!');
	}
}
