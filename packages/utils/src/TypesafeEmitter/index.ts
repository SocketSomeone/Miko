import { EventEmitter } from 'events';
import type { Arguments } from '../types';

interface ITypedEventEmitter<Events> {
	addListener<E extends keyof Events>(event: E, listener: Events[E]): this;
	on<E extends keyof Events>(event: E, listener: Events[E]): this;
	once<E extends keyof Events>(event: E, listener: Events[E]): this;
	prependListener<E extends keyof Events>(event: E, listener: Events[E]): this;
	prependOnceListener<E extends keyof Events>(event: E, listener: Events[E]): this;

	off<E extends keyof Events>(event: E, listener: Events[E]): this;
	removeAllListeners<E extends keyof Events>(event?: E): this;
	removeListener<E extends keyof Events>(event: E, listener: Events[E]): this;

	emit<E extends keyof Events>(event: E, ...args: Arguments<Events[E]>): boolean;
	eventNames(): (keyof Events | string | symbol)[];
	rawListeners<E extends keyof Events>(event: E): Function[];
	listeners<E extends keyof Events>(event: E): Function[];
	listenerCount<E extends keyof Events>(event: E): number;

	getMaxListeners(): number;
	setMaxListeners(maxListeners: number): this;
}

export class TypeSafeEmitter<T> extends (EventEmitter as { new <T>(): ITypedEventEmitter<T> })<T> {}
