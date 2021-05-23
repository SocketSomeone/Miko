export * from './utils';

export type AllowArray<T> = T | T[];

export type Constructor<T extends Object = {}> = new (...args: unknown[]) => T;

export type ObjectOfItems<T> = { [key: string]: T };

export type Arguments<T> = [T] extends [(...args: infer U) => unknown] ? U : [T] extends [void] ? [] : [T];

export type Awaited<T> = PromiseLike<T> | T;
