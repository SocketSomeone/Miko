import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { getParamNames } from '@miko/common';
import { DiscordMetadataAccessor } from './discord-metadata.accessor';
import { EventType } from './enums/event-type.enum';
import { CommandService } from './services';
import { DiscordClientProvider } from './discord-client.provider';
import type { IEventOptions } from './interfaces/event-options.interface';

@Injectable()
export class DiscordExplorer implements OnModuleInit {
	public constructor(
		private readonly commandService: CommandService,
		private readonly client: DiscordClientProvider,
		private readonly discoveryService: DiscoveryService,
		private readonly metadataAccessor: DiscordMetadataAccessor,
		private readonly metadataScanner: MetadataScanner,
		private readonly moduleRef: ModuleRef
	) {}

	public onModuleInit(): void {
		this.explore();
	}

	private async explore() {
		const instanceWrappers: InstanceWrapper[] = [
			...this.discoveryService.getControllers(),
			...this.discoveryService.getProviders()
		];

		instanceWrappers
			.filter(wrapper => wrapper.isDependencyTreeStatic())
			.forEach(wrapper => {
				const { instance } = wrapper;

				if (!instance || !Object.getPrototypeOf(instance)) {
					return;
				}

				this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), key =>
					this.lookup(instance, key)
				);
			});
	}

	private async lookup(instance: Record<string, Function>, key: string) {
		const methodRef = instance[key];
		const metadata = this.metadataAccessor.getEventOptions(methodRef);
		const methodFn = async (...args: unknown[]) => {
			await methodRef.call(instance, ...args);
		};

		if (!metadata) {
			return;
		}

		switch (metadata.type) {
			case EventType.ON:
			case EventType.ONCE: {
				return this.addEvents(metadata, methodFn);
			}

			case EventType.COMMAND: {
				return this.addCommand(instance, key, methodFn);
			}

			default:
				return;
		}
	}

	private addEvents({ events, type }: IEventOptions, methodRef: (...args: unknown[]) => Promise<unknown>) {
		events.forEach(event => {
			switch (type) {
				case EventType.ON:
					this.client.on(event, methodRef);
					break;
				case EventType.ONCE:
					this.client.once(event, methodRef);
					break;
				default:
					break;
			}
		});
	}

	private addCommand(instance: unknown, key: string, methodRef: Function) {
		const commandOptions = this.metadataAccessor.getCommandOptions(instance[key]);
		const parametersTypes = this.metadataAccessor.getParametersTypes(instance, key).slice(1);
		const parametersFn = getParamNames(instance[key]).slice(1);

		this.commandService.addCommand(
			Object.assign(commandOptions, {
				arguments: parametersFn.map((parameter, i) => Object.assign(parameter, { type: parametersTypes[i].name })),
				methodRef
			})
		);
	}
}
