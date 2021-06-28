import { CommonModule } from '@miko/common';
import { DiscoveryModule } from '@nestjs/core';
import { Module } from '@nestjs/common';

import type { DynamicModule, Provider } from '@nestjs/common';
import type { IDiscordModuleOptions } from './interfaces';

import { DiscordClientProvider } from './discord-client.provider';
import { DiscordMetadataAccessor } from './discord-metadata.accessor';
import { DiscordExplorer } from './discord.explorer';
import { DISCORD_MODULE_OPTIONS } from './discord.constants';

import * as services from './services';

@Module({
	imports: [CommonModule, DiscoveryModule],
	providers: Object.values(services),
	exports: Object.values(services)
})
export class DiscordModule {
	public static forRoot(opts: IDiscordModuleOptions): DynamicModule {
		return {
			global: true,
			imports: opts.imports || [],
			module: DiscordModule,
			providers: [
				DiscordModule.createOptionProvider(opts),
				DiscordExplorer,
				DiscordClientProvider,
				DiscordMetadataAccessor
			],
			exports: [DiscordClientProvider]
		};
	}

	private static createOptionProvider(opts: IDiscordModuleOptions): Provider {
		return {
			provide: DISCORD_MODULE_OPTIONS,
			useValue: opts || {}
		};
	}
}
