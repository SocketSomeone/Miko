import { AllowArray } from './types';

export function arrarify<T>(value: AllowArray<T>): T[] {
    return Array.isArray(value)
        ? value
        : [value];
}