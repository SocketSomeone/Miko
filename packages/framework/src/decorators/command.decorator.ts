import { applyDecorators, SetMetadata } from '@nestjs/common';
import { COMMAND_OPTIONS, EVENT_OPTIONS } from '../discord.constants';
import { EventType } from '../enums';

export function Command(name: string): MethodDecorator {
	return applyDecorators(
		SetMetadata(EVENT_OPTIONS, {
			events: null,
			type: EventType.COMMAND
		}),
		SetMetadata(COMMAND_OPTIONS, { name })
	);
}
