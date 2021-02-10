/* eslint-disable @typescript-eslint/ban-types */

import { IAutowiredOptions } from './models/autoware-options';

export type Constructor<T> = new (...args: unknown[]) => T;

export type AutowiredDecorator = (options?: IAutowiredOptions) => PropertyDecorator;