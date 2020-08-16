import { BaseClient } from '../../Client';
import { Guild, Member, Message, EmbedOptions, Embed, TextableChannel, User } from 'eris';
import { GuildPermission } from '../../Misc/Models/GuildPermissions';
import { Resolver, ResolverConstructor } from '../Resolvers/Resolver';
import { CommandGroup } from '../../Misc/Models/CommandGroup';

import i18n from 'i18n';
import { BaseSettings } from '../../Entity/GuildSettings';

interface Arg {
	name: string;
	resolver: Resolver | ResolverConstructor;
	required?: boolean;
	rest?: boolean;
	full?: boolean;
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
	aliases: string[];
	args?: Arg[];
	desc?: string;
	group: CommandGroup;
	extraExamples?: string;

	guildOnly: boolean;
	premiumOnly?: boolean;

	botPermissions?: GuildPermission[];
	userPermissions?: GuildPermission[];
}

export abstract class Command {
	public client: BaseClient;
	public resolvers: Resolver[];

	public name: string;
	public aliases: string[];
	public args: Arg[];
	public group: CommandGroup;
	public usage: string;
	public desc: string;
	public extraExamples: string;

	public guildOnly: boolean;
	public botPermissions?: GuildPermission[];
	public userPermissions?: GuildPermission[];
	public premiumOnly?: boolean;

	protected createEmbed: (options?: EmbedOptions, overrideFooter?: boolean) => Embed;
	protected replyAsync: (message: Message, t: TranslateFunc, reply: EmbedOptions | string) => Promise<Message>;
	protected sendAsync: (
		target: TextableChannel,
		t: TranslateFunc,
		embed: EmbedOptions | string,
		fallbackUser?: User
	) => Promise<Message>;
	protected showPaginated: (
		t: TranslateFunc,
		prevMsg: Message,
		page: number,
		maxPage: number,
		render: (page: number, maxPage: number) => Embed
	) => Promise<void>;

	public constructor(client: BaseClient, props: CommandOptions) {
		this.client = client;

		this.name = props.name;
		this.aliases = props.aliases.map((x) => x.toLowerCase());
		this.args = (props && props.args) || [];
		this.group = props.group;
		this.usage = `{prefix}${this.name} `;
		this.desc = (props && props.desc) || '';
		this.extraExamples = (props && props.extraExamples) || '';

		this.botPermissions = (props && props.botPermissions) || [];
		this.userPermissions = (props && props.userPermissions) || [];

		this.guildOnly = props.guildOnly;
		this.premiumOnly = props.premiumOnly;

		this.resolvers = [];

		this.args.map((arg) => {
			if (arg.resolver instanceof Resolver) {
				this.resolvers.push(arg.resolver);
			} else {
				this.resolvers.push(new arg.resolver(this.client));
			}

			delete arg.resolver;

			this.usage += arg.required ? `<${arg.name}> ` : `[${arg.name}] `;
		});

		this.createEmbed = client.messages.createEmbed.bind(client.messages);
		this.replyAsync = client.messages.sendReply.bind(client.messages);
		this.sendAsync = client.messages.sendEmbed.bind(client.messages);
		this.showPaginated = client.messages.showPaginated.bind(client.messages);
	}

	public async onLoaded() {
		this.startupDone();
	}

	protected startupDone() {
		if (this.client.config.runEnv === 'dev') {
			i18n.__({ locale: 'ru', phrase: `info.help.cmdDesc.${this.name.toLowerCase()}` });
		}
	}

	public abstract execute(message: Message, args: any[], context: Context): any;
}
