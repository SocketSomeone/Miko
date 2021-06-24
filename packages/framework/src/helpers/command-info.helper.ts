import type { ICommandOptions, ICommandParameter } from '../interfaces';
import type { CommandContext } from './command-context.helper';

export class CommandInfo implements ICommandOptions {
	public name: string;

	public group: string;

	public arguments?: ICommandParameter[];

	public methodRef?: Function;

	public constructor(opts: ICommandOptions) {
		Object.assign(this, opts);
	}

	public async execute(ctx: CommandContext, content: string): Promise<void> {
		// NO-OP
	}
}
