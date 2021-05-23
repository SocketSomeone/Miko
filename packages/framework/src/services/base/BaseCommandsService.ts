/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Message } from 'discord.js';
import { Logger } from 'tslog';
import { Lexer } from 'lexure';
import { AutoWired, ConfigService } from '@miko/common';
import type { GuildConfig } from '@miko/database';
import moment from 'moment';
import { Client } from '../../client';
import type { IParsedMessageData } from '../../types';
import { CommandHolderService } from '../CommandHolderService';

const COOLDOWN = 3;
const RATE_LIMIT = 1;

export abstract class BaseCommandsService {
	protected cooldowns: Map<string, number> = new Map();

	protected logger = new Logger({ name: this.constructor.name });

	protected lexer = new Lexer().setQuotes([
		['"', '"'],
		['“', '”']
	]);

	@AutoWired()
	protected client: Client;

	@AutoWired()
	protected commandHolderService: CommandHolderService;

	@AutoWired()
	protected configService: ConfigService;

	public constructor() {
		this.client.on('message', async message => {
			if (message.partial) await message.fetch();

			this.handleMessage(message);
		});

		this.client.on('messageUpdate', async (before, after) => {
			if (before.partial) await before.fetch();
			if (after.partial) await after.fetch();

			if (after.content === before.content) return;

			this.handleMessage(<Message>after);
		});
	}

	private async handleMessage(message: Message): Promise<void> {
		try {
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

			const guildConfig = await this.configService.getOrCreate(message.guild.id);

			const mentions = [`<@${this.client.user?.id}>`, `<@!${this.client.user?.id}>`];
			const prefixes = [...mentions, guildConfig.prefix];

			const parses = prefixes.map(prefix => this.parseWithPrefix(message, prefix));
			const parsed = parses.find(parsed => !!parsed);

			if (!parsed) {
				return;
			}

			return this.executeCommand(message, parsed, guildConfig);
		} catch (err) {
			this.logger.error('Error caused in handle command', err);
			return;
		}
	}

	private parseWithPrefix(message: Message, prefix: string): IParsedMessageData {
		const lowerContent = message.content.trim().toLowerCase();

		if (!lowerContent.startsWith(prefix.toLowerCase())) {
			return null;
		}

		const endOfPrefix = lowerContent.indexOf(prefix.toLowerCase()) + prefix.length;
		const startOfArgs = lowerContent.slice(endOfPrefix).search(/\S/) + prefix.length;
		const key = lowerContent.slice(startOfArgs).split(/\s{1,}|\n{1,}/)[0];
		const content = message.content.slice(startOfArgs + key.length + 1);

		return { key, content };
	}

	public async isRestricted({ author }: Message, ..._args: unknown[]): Promise<boolean> {
		const now = moment().valueOf();
		const before = this.cooldowns.get(author.id);

		if (before && now - before < RATE_LIMIT * 1000) {
			this.cooldowns.set(author.id, now + COOLDOWN * 1000);
			// TODO: Notification if exceeded ratelimit

			return true;
		}

		if (!before) this.cooldowns.set(author.id, moment().valueOf());

		return false;
	}

	protected abstract executeCommand(
		message: Message,
		parsed: IParsedMessageData,
		guildConfig: GuildConfig
	): Promise<void>;
}
