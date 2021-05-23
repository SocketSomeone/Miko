import { singleton } from 'tsyringe';
import type { GuildConfig } from '@miko/database';
import type { Guild, Message } from 'discord.js';
import type { BaseCommand } from '../models';
import type { IParsedMessageData } from '../types';
import { BaseCommandsService } from './base/BaseCommandsService';

@singleton()
export class InternalCommandsService extends BaseCommandsService {
	protected async executeCommand(
		message: Message,
		{ key, content }: IParsedMessageData,
		guildConfig: GuildConfig
	): Promise<void> {
		const command = this.commandHolderService.get(key);

		if (!command || command.hidden) return;

		if (await this.isRestricted(message, command)) return;

		if (command.permissions.length > 0) {
			const self = message.guild.member(this.client.user.id);
			const missing = self.permissionsIn(message.channel).missing(command.permissions);

			if (missing && missing.length > 0) {
				// TODO: Notification if dont have permissions
				return;
			}
		}

		const args = await this.parseArgs(message.guild, command, content);

		try {
			await command.execute(message, args);
		} finally {
			this.logger.error('test');
		}
	}

	public async isRestricted(message: Message, command: BaseCommand): Promise<boolean> {
		if (!(await command.isAvailable(message))) {
			return true;
		}

		return super.isRestricted(message);
	}

	private async parseArgs(guild: Guild, command: BaseCommand, input: string): Promise<unknown[] | undefined> {
		const args = new Set();
		const tokens = this.lexer.setInput(input).lex();

		for (let i = 0; i < command.arguments.length; i += 1) {
			const { resolver, optional, remaining } = command.arguments[i];
			const resolved = await resolver.resolve(
				remaining ? tokens.slice(i, tokens.length).join(' ') : tokens[i]?.value,
				guild
			);

			if (!resolved && !optional) {
				return;
			}

			args.add(resolved);

			if (remaining) break;
		}

		return [...args];
	}
}
