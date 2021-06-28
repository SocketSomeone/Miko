/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IFunctionParameter } from '@miko/common';

export interface ICommandParameter extends IFunctionParameter {
	type: any;
	remaining: boolean;
}
