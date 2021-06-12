/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ICommandOptions } from './interfaces';
import { COMMAND_OPTIONS, EVENT_OPTIONS } from './discord.constants';
import type { IEventOptions } from './interfaces/event-options.interface';

@Injectable()
export class DiscordMetadataAccessor {
	constructor(private readonly reflector: Reflector) {}

	getEventOptions(target: Function): IEventOptions | undefined {
		return this.reflector.get(EVENT_OPTIONS, target);
	}

	getCommandOptions(target: Function): ICommandOptions | undefined {
		return this.reflector.get(COMMAND_OPTIONS, target);
	}

	getParametersTypes(instance: unknown, target: string): any[] {
		return Reflect.getMetadata('design:paramtypes', instance, target);
	}
}
