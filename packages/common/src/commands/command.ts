import { Message, Permissions } from 'discord.js';
import { MiResolver } from '../resolvers';
import { GuardFunction, ResolverOrConstructor } from '../types';

interface IArg {
	name: string;
	Resolver: ResolverOrConstructor<unknown>;
	required: boolean;
}

interface ICommandOptions {
	name: string;
	group: string;
	guards?: GuardFunction[];
	args?: IArg[];
	botPermissions?: Permissions[];
	userPermissions?: Permissions[];
}

export abstract class MiCommand {
	public name!: string;

	public group!: string;

	public guards: GuardFunction[] = [];

	public resolvers: MiResolver<unknown>[] = [];

	private guildOnly = true;

	private premiumOnly = false;

	private botPermissions: Permissions[] = [];

	private userPermissions: Permissions[] = [];

	public constructor({ args, ...opts }: ICommandOptions) {
		Object.assign(this, opts);

		if (args) {
			args.map(arg => {
				if (arg.Resolver instanceof MiResolver) {
					this.resolvers.push(arg.Resolver);
				} else {
					this.resolvers.push(new arg.Resolver());
				}

				return null;
			});
		}
	}

	public abstract execute(message: Message): Promise<void>;
}
