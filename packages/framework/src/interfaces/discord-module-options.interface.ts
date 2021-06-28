import type { ModuleMetadata } from '@nestjs/common';
import type { ClientOptions } from 'discord.js';

export interface IDiscordModuleOptions extends ClientOptions {
	imports?: ModuleMetadata['imports'];
}
