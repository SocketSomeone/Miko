import { AllowArray } from './types';

export const arrarify = <T>(value: AllowArray<T>): T[] => (Array.isArray(value) ? value : [value]);
