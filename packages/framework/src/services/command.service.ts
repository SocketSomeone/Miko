import { Lexer } from 'lexure';
import { Injectable, Logger } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { SentryService } from '@miko/common';
import type { Constructor } from '@miko/common';
import type { ICommandOptions } from '../interfaces';
import type { CommandContext } from '../helpers';
import type { BaseTypeReader } from '../readers/base/typereader.base';
import { DiscordClientProvider } from '../discord-client.provider';
import { BooleanTypeReader } from '../readers/boolean.typereader';
import { MessageService } from './message.service';

@Injectable()
export class CommandService implements OnModuleInit {
	private logger = new Logger(CommandService.name);

	private commands: Map<string, ICommandOptions> = new Map();

	private typeReaders: Map<string, BaseTypeReader<unknown>> = new Map();

	protected lexer = new Lexer().setQuotes([
		["'", "'"],
		['"', '"'],
		['“', '”']
	]);

	public constructor(
		private client: DiscordClientProvider,
		private messageService: MessageService,
		private sentryService: SentryService
	) {}

	public onModuleInit(): void {
		this.addTypeReader(Boolean, BooleanTypeReader);
	}

	public addCommand(cmd: ICommandOptions): void {
		if (this.commands.has(cmd.name)) {
			this.logger.warn(`Command ${cmd.name} has duplicate, replacing...`);
		}

		this.commands.set(cmd.name, cmd);
		this.logger.log(`Command ${cmd.name} added...`);
	}

	public addTypeReader(type: Function | string, Reader: Constructor<BaseTypeReader<unknown>>): void {
		const typeName = typeof type === 'function' ? type.name : type;

		this.typeReaders.set(typeName, new Reader());
		this.logger.log(`Added TypeReader for type ${typeName}`);
	}

	private getTypeReader(type: Function | string): BaseTypeReader<unknown> {
		return this.typeReaders.get(typeof type === 'function' ? type.name : type);
	}

	public async execute(context: CommandContext, argPos: number): Promise<void> {
		const { message } = context;

		const lowerContent = message.content.toLowerCase().trim();
		const key = lowerContent.slice(argPos).split(/\s{1,}|\n{1,}/)[0];
		const content = message.content.slice(argPos + key.length + 1);

		const command = this.commands.get(key);

		if (!command) {
			return;
		}

		try {
			const args = await this.parseArguments(context, command, content);

			await command.methodRef(context, ...args);
		} catch (err) {
			// NO-OP
		} finally {
			this.logger.log(`Command ${command.name} executed by ${context.user.username}`);
		}
	}

	public async parseArguments(context: CommandContext, cmd: ICommandOptions, input: string): Promise<Set<unknown>> {
		const args = new Set();
		const tokens = this.lexer
			.setInput(input)
			.lex()
			.map(token => token.value);

		for (let i = 0; i < cmd.arguments.length; i += 1) {
			const argument = cmd.arguments[i];
			const typereader = this.getTypeReader(argument.type);
			const token = argument.remaining ? tokens.slice(i, tokens.length).join(' ') : tokens[i];

			if (!typereader) {
				this.logger.warn(`Typereader for ${argument.name} not found!`, cmd.name.toUpperCase());
				return;
			}

			const result = await typereader.read(context, token);

			if (!result && !argument.optional) {
				this.logger.warn(`Required argument missed!`, cmd.name.toUpperCase());
				return;
			}

			args.add(result);

			if (argument.remaining) {
				break;
			}
		}

		return args;
	}
}
