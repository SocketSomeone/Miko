/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Message, PermissionResolvable } from 'discord.js';
import type { Awaited } from '@miko/common';
import { AutoWired, GatewayService } from '@miko/common';
import type { ICommandArgument, ICommandOptions } from '../types';
import { BaseArgument } from './BaseArgument';

export abstract class BaseCommand implements ICommandOptions {
	@AutoWired()
	protected gatewayService: GatewayService;

	public name!: string;

	public group!: string;

	public onlyGuild = true;

	public onlyPremium = true;

	public hidden = false;

	public arguments: ICommandArgument[] = [];

	public permissions: PermissionResolvable[] = ['SEND_MESSAGES', 'EMBED_LINKS'];

	public constructor(opts: ICommandOptions) {
		Object.assign(this, opts);

		opts?.arguments?.forEach(({ argument: Argument }, i) => {
			this.arguments[i].argument = Argument instanceof BaseArgument ? Argument : new Argument();
		});
	}

	public async isAvailable(message: Message): Promise<boolean> {
		if (this.onlyGuild && !message.guild) {
			return false;
		}

		return true;
	}

	public abstract execute(message: Message, args: unknown[]): Awaited<void>;
}
