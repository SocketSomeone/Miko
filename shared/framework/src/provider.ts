/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable lines-between-class-members */
import { Logger } from '@miko/logger';
import { MiCache } from '@miko/cache';
import { AllowArray, Constructor } from './types';
import {
    MiModule,
    MiService,
    MiCommand,
    cacheInjections,
    serviceInjections
} from '.';
import { arrarify } from './helpers';

export class MiProvider {
    protected logger = new Logger('PROVIDER');

    protected modules: Map<Constructor<MiModule>, MiModule> = new Map();
    protected services: Map<Constructor<MiService>, MiService> = new Map();
    protected caches: Map<Constructor<MiCache>, MiCache> = new Map();
    protected commands: Map<Constructor<MiCommand>, MiCommand> = new Map();

    private startingServices: MiService[] = [];

    public async init() {
        this.logger.verbose('Initializing injections...');

        this.services.forEach((s) => this.setupInjections(s));
        this.caches.forEach((c) => this.setupInjections(c));
        this.commands.forEach((c) => this.setupInjections(c));

        this.logger.verbose('Initializing services...');

        this.startingServices = [...this.services.values()];

        await Promise.all([...this.modules.values()].map((mod) => mod.init()));
        await Promise.all([...this.services.values()].map((srv) => srv.init()));
        await Promise.all([...this.commands.values()].map((cmd) => cmd.init()));
    }

    public async onClientReady() {
        await Promise.all([...this.services.values()].map(x => x.onClientReady()));
    }

    protected setupInjections(obj: any): void {
        this.makeInjection(obj, serviceInjections, this.services);
        this.makeInjection(obj, cacheInjections, this.caches);
    }

    private makeInjection<T>(
        obj: any,
        injections: Map<unknown, Map<string, unknown>>,
        storage: Map<Constructor<T>, T>
    ) {
        const objName = obj.name ?? obj.constructor.name;

        let tempObj = obj.constructor;

        while (tempObj) {
            const injs = injections.get(tempObj) || new Map();

            for (const [key, getInjType] of injs) {
                const injConstr = getInjType();
                const inj = storage.get(injConstr);

                if (!inj) {
                    throw new Error(`Could not inject ${injConstr.name} into ${objName}:${key}`);
                }

                obj[key] = inj;
                this.logger.verbose(`Injected ${injConstr.name} into ${objName}:${key}`);
            }

            tempObj = Object.getPrototypeOf(tempObj);
        }
    }

    public registerModule<T extends MiModule>(rawModules: AllowArray<Constructor<T>>): void {
        const modules = arrarify(rawModules);

        for (const Module of modules) {
            if (this.modules.has(Module)) {
                throw new Error(`Module ${Module.name} registered multiple times`);
            }

            this.modules.set(Module, new Module(this));
        }
    }

    public registerService<T extends MiService>(Module: MiModule, rawServices: AllowArray<Constructor<T>>): void {
        const services = arrarify(rawServices);

        for (const Service of services) {
            if (this.services.has(Service)) {
                throw new Error(`Service ${Service.name} registered multiple times`);
            }

            this.services.set(Service, new Service(Module));
        }
    }

    public registerCommand<T extends MiCommand>(Module: MiModule, rawCommands: AllowArray<Constructor<T>>): void {
        const commands = arrarify(rawCommands);

        for (const Command of commands) {
            if (this.commands.has(Command)) {
                throw new Error(`Command ${Command.name} (${new Command(Module).name}) registered multiple times`);
            }

            this.commands.set(Command, new Command(Module));
        }
    }

    public registerCache<T extends MiCache>(rawCaches: AllowArray<Constructor<T>>): void {
        const caches = arrarify(rawCaches);

        for (const Cache of caches) {
            if (this.caches.has(Cache)) {
                throw new Error(`Cache ${Cache.name} registered multiple times`);
            }

            this.caches.set(Cache, new Cache());
        }
    }

    public serviceStartupDone(service: MiService): void {
        this.startingServices = this.startingServices.filter((s) => s !== service);

        if (this.startingServices.length === 0) {
            this.logger.log('All services is ready!');
        }
    }
}