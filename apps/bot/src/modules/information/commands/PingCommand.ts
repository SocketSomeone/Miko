import { MiClient, MiCommand } from '@miko/common';
import { injectable } from 'tsyringe';
import { Message } from 'discord.js';

@injectable()
export class PingCommand extends MiCommand {
	public constructor(private readonly client: MiClient) {
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
