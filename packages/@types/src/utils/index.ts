import type { AllowArray } from '..';

export const arrarify = <T>(value: AllowArray<T>): T[] => (Array.isArray(value) ? value : [value]);
