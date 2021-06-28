import type { ICommandParameter } from './command-parameter.interface';

export interface ICommandOptions {
	name: string;
	group: string;
	arguments?: ICommandParameter[];
	methodRef?: Function;
}
