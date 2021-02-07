import { Permissions } from 'discord.js';
import { MiResolver } from '../resolvers';
import { GuardFunction, ResolverOrConstructor } from '../types';

interface IArg {
    name: string;
    resolver: ResolverOrConstructor<unknown>;
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

    private guards: GuardFunction[] = [];

    private resolvers: MiResolver<unknown>[] = [];

    private guildOnly: boolean = true;

    private premiumOnly: boolean = false;

    private botPermissions: Permissions[] = [];

    private userPermissions: Permissions[] = [];

    public constructor({ args, ...opts }: ICommandOptions) {
        Object.assign(this, opts);

        if (args) {
            args.map((arg) => {
                if (arg.resolver instanceof MiResolver) {
                    this.resolvers.push(arg.resolver);
                } else {
                    this.resolvers.push(new arg.resolver());
                }
            });
        }

    }

    public async startCommand() {

    }

    protected abstract execute(): Promise<void>;
}