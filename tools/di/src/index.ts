import 'reflect-metadata';
import { DI } from './di';

export * from './decorators/injectable';
export * from './models/autoware-lifetimes';
export * from './di';

export const {
    autowired: Autowired,
    resolve: Resolve,
    reset: Reset
} = new DI();