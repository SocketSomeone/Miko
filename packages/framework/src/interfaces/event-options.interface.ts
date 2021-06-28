import type { ClientEvents } from 'discord.js';
import type { EventType } from '../enums';

export interface IEventOptions {
	events?: (keyof ClientEvents)[];
	type: EventType;
}
