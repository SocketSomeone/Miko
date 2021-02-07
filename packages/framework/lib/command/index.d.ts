import { Permissions } from 'discord.js';
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
export declare abstract class MiCommand {
    name: string;
    group: string;
    private guards;
    private resolvers;
    private guildOnly;
    private premiumOnly;
    private botPermissions;
    private userPermissions;
    constructor({ args, ...opts }: ICommandOptions);
    startCommand(): Promise<void>;
    protected abstract execute(): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map