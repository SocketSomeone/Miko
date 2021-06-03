import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { UnauthorizedException, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constants';
import { DiscordService } from '../services/discord.service';

@Injectable()
export class DiscordAuth implements CanActivate {
	public constructor(private reflector: Reflector, private discordService: DiscordService) {}

	public async canActivate(host: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [host.getHandler(), host.getClass()]);

		if (isPublic) return true;

		const ctx = host.switchToHttp();

		const req = ctx.getRequest();

		const token = req.headers.authorization;
		const user = await this.discordService.getUserInfo(token);

		if (!user) {
			throw new UnauthorizedException();
		}

		req.locals = {
			token,
			user
		};

		return !!user;
	}
}
