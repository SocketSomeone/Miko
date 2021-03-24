import { DMChannel, Message } from 'discord.js';
import { injectable } from 'tsyringe';
import { Client } from '../../framework/client';
import { Command } from '../../framework/commands/command';

@injectable()
export class PermissionSecurity {
	// eslint-disable-next-line no-useless-constructor
	public constructor(private readonly client: Client) {}

	public isSuccess(message: Message, command: Command): boolean {
		if (message.channel instanceof DMChannel || !this.client.user) {
			return false;
		}

		if (command.clientPermissions && message.guild) {
			const missing = message.channel.permissionsFor(this.client.user)?.missing(command.clientPermissions);

			if (missing && missing.length) {
				return true;
			}
		}

		if (command.userPermissions && message.guild) {
			const missing = message.channel.permissionsFor(message.author)?.missing(command.userPermissions);

			if (missing && missing.length) {
				return true;
			}
		}

		return false;
	}
}
