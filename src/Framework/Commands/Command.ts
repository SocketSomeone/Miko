import i18n from 'i18n';

import { BaseClient } from '../../Client';
import { Guild, Member, Message, Embed } from 'eris';
import { GuildPermission } from '../../Misc/Models/GuildPermissions';
import { Resolver, ResolverConstructor } from '../Resolvers/Resolver';
import { CommandGroup } from '../../Misc/Models/CommandGroup';
import { BaseSettings } from '../../Entity/GuildSettings';
import { Images } from '../../Misc/Enums/Images';
import { Color } from '../../Misc/Enums/Colors';
import { Service } from '../Decorators/Service';
import {
	CreateEmbedFunc,
	ReplyFunc,
	SendFunc,
	MessagingService,
	ShowPaginatedFunc,
	awaitReactionsFunc as AwaitReactionsFunc
} from '../Services/Messaging';
import { BaseModule } from '../Module';

interface Arg {
	name: string;
	resolver: Resolver | ResolverConstructor;
	required?: boolean;
	full?: boolean;
	rest?: boolean;
}

export type TranslateFunc = (key: string, replacements?: { [key: string]: any }) => string;
export type EmojiResolve = (emoji: string) => string;

export type Context = {
	guild: Guild;
	me: Member;
	funcs: {
		t: TranslateFunc;
		e: EmojiResolve;
	};
	settings: BaseSettings;
	isPremium: boolean;
};

interface CommandOptions {
	name: string;
	group: CommandGroup;
	aliases: string[];
	examples?: string[];
	args?: Arg[];
	desc?: string;
	guildOnly: boolean;
	premiumOnly?: boolean;

	botPermissions?: GuildPermission[];
	userPermissions?: GuildPermission[];
}

export abstract class BaseCommand {
	public client: BaseClient;
	public module: BaseModule;
	public resolvers: Resolver[];

	public name: string;

	public aliases: string[];
	public args: Arg[];

	public group: CommandGroup;
	public usage: string;
	public guildOnly: boolean;
	public premiumOnly?: boolean;

	public botPermissions?: GuildPermission[];
	public userPermissions?: GuildPermission[];

	public examples: string[];

	@Service() protected msg: MessagingService;

	protected createEmbed: CreateEmbedFunc;
	protected replyAsync: ReplyFunc;
	protected sendAsync: SendFunc;
	protected showPaginated: ShowPaginatedFunc;
	protected awaitReactions: AwaitReactionsFunc;

	public constructor(module: BaseModule, props: CommandOptions) {
		this.module = module;
		this.client = module.client;

		this.name = props.name;
		this.aliases = props.aliases.map((x) => x.toLowerCase());

		this.usage = `${this.name} `;
		this.group = props.group;
		this.args = (props && props.args) || [];
		this.examples = (props && props.examples) || [];

		this.botPermissions = (props && props.botPermissions) || [];
		this.userPermissions = (props && props.userPermissions) || [];

		this.guildOnly = props.guildOnly;
		this.premiumOnly = props.premiumOnly;
	}

	public async init() {
		this.createEmbed = this.msg.createEmbed.bind(this.msg);
		this.replyAsync = this.msg.sendReply.bind(this.msg);
		this.sendAsync = this.msg.sendEmbed.bind(this.msg);
		this.showPaginated = this.msg.showPaginated.bind(this.msg);

		this.resolvers = [];

		this.args.map((arg) => {
			if (arg.resolver instanceof Resolver) {
				this.resolvers.push(arg.resolver);
			} else {
				this.resolvers.push(new arg.resolver(this.module));
			}

			delete arg.resolver;

			this.usage += arg.required ? `<${arg.name}> ` : `[${arg.name}] `;
		});
	}

	protected getDescription(t: TranslateFunc) {
		const key = `info.help.cmdDesc.${this.name.toLowerCase()}`;
		const desc = t(key);

		if (key === desc) {
			console.error(`Command ${this.name} desc not found!`);
			process.exit(0);
		}

		return desc;
	}

	protected checkDependies() {
		if (this.args.filter((x) => x.required).length >= 1 && this.examples.length < 1) {
			console.error(`Missed examples for arguments in command "${this.name}"`);
			process.exit(1);
		}

		this.getDescription((phrase, rep) => i18n.__({ locale: 'ru', phrase }, rep));
	}

	public getHelp(t: TranslateFunc, prefix: string): Embed {
		const description = this.getDescription(t);
		const field = this.args.filter((x) => x.required).length < 1 ? prefix + this.name + '\n' : '';

		return this.createEmbed({
			color: Color.GRAY,
			author: { name: prefix + this.usage, icon_url: Images.SETTINGS },
			description,
			fields: [
				{
					name: t('info.help.cmd.ex'),
					inline: false,
					value: '>>> ' + field + this.examples.map((ex) => prefix + this.name + ' ' + ex).join('\n')
				},
				{
					name: t('info.help.cmd.aliases'),
					value: this.aliases.length >= 1 ? this.aliases.map((x) => `\`${x}\``).join(', ') : null,
					inline: false
				}
			],
			footer: null
		});
	}

	public abstract execute(message: Message, args: any[], context: Context): any;
}
