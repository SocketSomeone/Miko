import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

export const Token = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const { locals } = ctx.switchToHttp().getRequest();

	return locals.token;
});
