/* eslint-disable no-use-before-define */
import { Module } from '@nestjs/common';
import { DiscordModule } from '@miko/framework';
import { GatewayModule } from './gateway/gateway.module';
import { UtilitiesModule } from './utilities/utilities.module';

@Module({
	imports: [
		DiscordModule.forRoot({
			disableMentions: 'everyone',
			messageEditHistoryMaxSize: 50,
			messageCacheMaxSize: 100,
			messageCacheLifetime: 240,
			messageSweepInterval: 250,
			fetchAllMembers: true,
			presence: {
				activity: {
					name: 'mikoapp.xyz | !help',
					type: 'WATCHING',
					url: 'https://mikoapp.xyz'
				},
				status: 'online'
			},
			ws: {
				compress: false,
				intents: [
					'DIRECT_MESSAGES',
					'DIRECT_MESSAGE_REACTIONS',
					'GUILDS',
					'GUILD_BANS',
					'GUILD_EMOJIS',
					'GUILD_VOICE_STATES',
					'GUILD_EMOJIS',
					'GUILD_MEMBERS',
					'GUILD_MESSAGES',
					'GUILD_MESSAGE_REACTIONS'
				]
			}
		}),
		GatewayModule,
		UtilitiesModule
	]
})
export class AppModule {}
