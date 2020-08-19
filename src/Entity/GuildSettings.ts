import { BaseEntity, Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { EmojisDefault } from '../Misc/Enums/EmojisDefaults';
import { Violation } from '../Misc/Enums/Violation';
import { SetTransformer } from './Transformers/SetTransformer';
import { BaseGuild } from './Guild';
import { WelcomeChannelType, WelcomeMessage } from '../Misc/Enums/WelcomeTypes';
import { EmbedOptions } from 'eris';
import { TranslateFunc } from '../Framework/Commands/Command';
import { LogType } from '../Modules/Log/Services/Handle';

interface GuildPrices {
	timely: string;
	standart: string;
}

enum Lang {
	ru = 'ru'
}

@Entity()
export class BaseSettings extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column({ type: 'varchar', default: '!' })
	public prefix: string = '!';

	@Column({ type: 'varchar' })
	public locale: Lang = Lang.ru;

	@Column({ type: 'varchar', default: {}, array: true })
	public ignoreChannels: string[] = [];

	@Column({ type: 'varchar', default: null, nullable: true })
	public modlog: string = null;

	@Column({ type: 'varchar', default: null, nullable: true })
	public mutedRole: string = null;

	@Column({ type: 'varchar', default: null, nullable: true })
	public privateManager: string = null;

	@Column({ type: 'varchar', default: EmojisDefault.WALLET })
	public currency: string = EmojisDefault.WALLET;

	@Column({
		type: 'json',
		default: {
			timely: '15',
			standart: '100'
		}
	})
	public prices: GuildPrices = {
		timely: '15',
		standart: '100'
	};

	@Column({
		type: 'json',
		default: {}
	})
	public autoMod: {
		[key in Violation]: boolean;
	} = {
		[Violation.invites]: false,
		[Violation.allCaps]: false,
		[Violation.duplicateText]: false,
		[Violation.zalgo]: false,
		[Violation.emojis]: false,
		[Violation.externalLinks]: false,
		[Violation.mentions]: false
	};

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	public autoModIgnoreRoles: Set<string> = new Set();

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	public autoModIgnoreChannels: Set<string> = new Set();

	@Column({ type: 'boolean', default: false })
	public welcomeEnabled: boolean = false;

	@Column({ type: 'varchar', default: {}, array: true, transformer: SetTransformer })
	public onWelcomeRoles: Set<string> = new Set();

	@Column({ type: 'boolean', default: false })
	public welcomeSaveRoles: boolean = false;

	@Column({ type: 'integer', default: null, nullable: true })
	public welcomeChannelType: WelcomeChannelType = null;

	@Column({ type: 'bigint', default: null, nullable: true })
	public welcomeChannel: string = null;

	@Column({ type: 'integer', default: null, nullable: true })
	public welcomeMessageType: WelcomeMessage = null;

	@Column({ type: 'varchar', default: null, nullable: true })
	public welcomeMessage: string = null;

	@Column({ type: 'json', default: {} })
	public logger: { [key in LogType]: string } = {
		[LogType.BAN]: null,
		[LogType.UNBAN]: null,

		[LogType.CHANNEL_CREATE]: null,
		[LogType.CHANNEL_DELETE]: null,

		[LogType.EMOJI_CREATE]: null,
		[LogType.EMOJI_UPDATE]: null,
		[LogType.EMOJI_DELETE]: null,

		[LogType.ROLE_CREATE]: null,
		[LogType.ROLE_DELETE]: null,
		[LogType.ROLE_UPDATE]: null
	};
}
