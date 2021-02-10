/* eslint-disable @typescript-eslint/no-explicit-any */
import { resolveService } from '../utils/resolver';

export function Injectable(): ClassDecorator {
    return target => {
        resolveService(target as any);
    };
}