/* eslint-disable consistent-return */
import { Message, PermissionResolvable } from 'discord.js';
import { MiResolver } from '../resolvers';
import { GuardFunction, ICommandArgument, ICommandOptions } from '../types';

export abstract class MiCommand implements ICommandOptions {
	public name!: string;

	public group = 'default';

	public typing = false;

	public cooldown = 5;

	public ratelimit = 2;

	public guards: GuardFunction[] = [];

	public arguments: ICommandArgument[] = [];

	public clientPermissions: PermissionResolvable[] = [];

	public userPermissions: PermissionResolvable[] = [];

	public constructor(opts: ICommandOptions) {
		Object.assign(this, opts);

		this.arguments.forEach(argument => {
			// eslint-disable-next-line new-cap
			argument.resolver = argument.resolver instanceof MiResolver ? argument.resolver : new argument.resolver();
		});
	}

	public abstract execute(message: Message, args: unknown[]): Promise<void>;

	public checkGuards(message: Message): boolean {
		return this.guards.every(guard => guard(message) === true);
	}

	// TODO: Refactor this or KYS :)
	public async parse(message: Message, content = ''): Promise<unknown[] | undefined> {
		const rawArgs = this.rawArgs(content.split(' '));
		const args: unknown[] = [];

		let i = 0;

		for (const { resolver, afterContain, optional } of this.arguments) {
			const rawVal = rawArgs[i] && afterContain ? rawArgs.slice(i, rawArgs.length).join(' ') : rawArgs[i];

			try {
				const val = await (resolver as MiResolver<unknown>).resolve(rawVal, message.guild);

				if (typeof val === typeof undefined && !optional) {
					return;
				}

				args.concat(val);
			} catch (err) {
				return;
			}

			i += 1;
		}

		return args;
	}

	private rawArgs(splits: string[]): string[] {
		const rawArgs: string[] = [];

		let quote = false;
		let acc = '';

		for (let j = 0; j < splits.length; j += 1) {
			const split = splits[j];

			if (split.length === 0) {
				continue;
			}

			if (!quote && split.startsWith(`"`)) {
				quote = true;
				acc = split;

				continue;
			}

			if (split.endsWith(`"`)) {
				quote = false;
				acc += ` ${split}`;

				rawArgs.push(acc);

				continue;
			}

			if (quote) {
				acc += ` ${split}`;
			} else {
				rawArgs.push(split);
			}
		}

		return acc.length < 1 ? rawArgs : rawArgs.concat(acc);
	}
}
