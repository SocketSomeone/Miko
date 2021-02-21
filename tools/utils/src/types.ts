export type AllowArray<T> = T | T[];

export type Constructor<T> = new (...args: unknown[]) => T;

export type ObjectOfItems<T> = { [key: string]: T };
