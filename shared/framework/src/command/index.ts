/* eslint-disable lines-between-class-members */
import { Message } from 'discord.js';
import { MiClient, MiModule, MiResolver } from '..';
import { ResolverOrConstructor } from '../types';

interface ICommandArgument {
    name: string;
    resolver: ResolverOrConstructor<unknown>;
    required?: boolean;
}

interface ICommandOptions {
    name: string;

    args?: ICommandArgument[];

    guildOnly?: boolean;
    premiumOnly?: boolean;
}

export abstract class MiCommand {
    public client: MiClient;
    public module: MiModule;

    public resolvers!: MiResolver<unknown>[];

    public name!: string;

    public guildOnly?: boolean;
    public premiumOnly?: boolean;

    public constructor(module: MiModule, opts: ICommandOptions) {
        this.module = module;
        this.client = module.client;

        Object.assign(this, opts);
    }

    public async init(): Promise<void> {
        this.resolvers = [];
    }

    public abstract execute(message: Message): void;
}