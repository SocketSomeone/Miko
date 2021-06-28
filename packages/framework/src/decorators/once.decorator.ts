import type { ClientEvents } from 'discord.js';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { EVENT_OPTIONS } from '../discord.constants';
import { EventType } from '../enums';

export function Once(...events: (keyof ClientEvents)[]): MethodDecorator {
	return applyDecorators(
		SetMetadata(EVENT_OPTIONS, {
			events,
			type: EventType.ONCE
		})
	);
}
