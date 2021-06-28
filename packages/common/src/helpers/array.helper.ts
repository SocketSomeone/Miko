import type { AllowArray } from '../interfaces';

export const arrarify = <T>(value: AllowArray<T>): T[] => (Array.isArray(value) ? value : [value]);
