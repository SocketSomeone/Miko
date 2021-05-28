import type { Awaited } from '@miko/types';
import type { IRabbitEvents } from '.';

export type GatewayCallback<Q extends keyof IRabbitEvents = keyof IRabbitEvents> = (
	payload?: IRabbitEvents[Q]
) => Awaited<Object | void | null>;
