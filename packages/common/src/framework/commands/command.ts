/* eslint-disable consistent-return */
import { Lexer } from 'lexure';
import type { Message, PermissionResolvable } from 'discord.js';
import type { Awaited } from '@miko/utils/src';
import { Resolver } from '../resolvers';
import type { GuardFunction, ICommandArgument, ICommandOptions } from '../../types';

export abstract class Command implements ICommandOptions {
	public name!: string;

	public group = 'default';

	public typing = false;

	public cooldown = 5;

	public ratelimit = 2;

	public guards: GuardFunction[] = [];

	public arguments: ICommandArgument[] = [];

	public clientPermissions: PermissionResolvable[] = [];

	public userPermissions: PermissionResolvable[] = [];

	protected lexer = new Lexer().setQuotes([
		['"', '"'],
		['“', '”']
	]);

	public constructor(opts: ICommandOptions) {
		Object.assign(this, opts);

		opts?.arguments?.forEach(({ resolver }, i) => {
			// eslint-disable-next-line new-cap
			this.arguments[i].resolver = resolver instanceof Resolver ? resolver : new resolver();
		});
	}

	public abstract execute(message: Message, args: unknown[]): Awaited<void>;

	public checkGuards(message: Message): boolean {
		return this.guards.every(guard => guard(message) === true);
	}

	public async parse(message: Message, input = ''): Promise<unknown[] | undefined> {
		const args: Set<unknown> = new Set();
		const tokens = this.lexer.setInput(input).lex();

		for (let i = 0; i < this.arguments.length; i += 1) {
			const { resolver, optional } = this.arguments[i];
			const resolved = await resolver.resolve(tokens[i]?.value, message.guild);

			if (!resolved && !optional) {
				return;
			}

			args.add(resolved);
		}

		return [...args];
	}
}
