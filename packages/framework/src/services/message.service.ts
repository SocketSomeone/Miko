/* eslint-disable no-underscore-dangle */
// import i18n from 'i18n';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import type { OnModuleInit } from '@nestjs/common';
import { GuildConfigService } from '@miko/common';
import type { Guild, Message, MessageEmbed } from 'discord.js';
import type { TranslateFunc } from '../interfaces';
import { EmbedColors } from '../enums/embed-colors.enum';

@Injectable()
export class MessageService implements OnModuleInit {
	public constructor(private configService: ConfigService, private guildConfig: GuildConfigService) {}

	public async onModuleInit(): Promise<void> {
		// i18n.configure({
		// locales: ['en', 'ru'],
		// defaultLocale: 'en',
		// syncFiles: true,
		// autoReload: true,
		// directory: join(process.cwd(), 'src/i18n'),
		// objectNotation: true
		// });
	}

	// public async getTranslateFunction(guild: Guild): Promise<TranslateFunc> {
	// const { locale } = await this.guildConfig.getOrCreate(guild.id);
	//
	// return (phrase: string, replace: string[]) => i18n.__({ locale, phrase }, ...replace);
	// }

	public async reply(input: string, color = EmbedColors.ROYAL_BLUE): Promise<Message> {
		return null;
	}

	private getDefaultEmbed(): Partial<MessageEmbed> {
		return {};
	}
}
