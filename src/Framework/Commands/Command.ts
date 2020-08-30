import i18n from 'i18n';

import { BaseClient } from '../../Client';
import { Guild, Member, Message, EmbedOptions, Embed, TextableChannel, User } from 'eris';
import { GuildPermission } from '../../Misc/Models/GuildPermissions';
import { Resolver, ResolverConstructor } from '../Resolvers/Resolver';
import { CommandGroup } from '../../Misc/Models/CommandGroup';
import { BaseSettings } from '../../Entity/GuildSettings';
import { BaseEmbedOptions } from '../../Types';
import { Images } from '../../Misc/Enums/Images';
import { Color } from '../../Misc/Enums/Colors';

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

export abstract class Command {
	public client: BaseClient;
	public resolvers: Resolver[];

	public name: string;
	public aliases: string[];
	public args: Arg[];
	public group: CommandGroup;
	public usage: string;
	public examples: string[];

	public guildOnly: boolean;
	public botPermissions?: GuildPermission[];
	public userPermissions?: GuildPermission[];
	public premiumOnly?: boolean;

	protected createEmbed: (options?: BaseEmbedOptions) => Embed;
	protected replyAsync: (message: Message, t: TranslateFunc, reply: BaseEmbedOptions | string) => Promise<Message>;
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
		this.usage = `${this.name} `;
		this.aliases = props.aliases.map((x) => x.toLowerCase());
		this.group = props.group;
		this.args = (props && props.args) || [];
		this.examples = (props && props.examples) || [];

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

		if (this.args.filter((x) => x.required).length >= 1 && this.examples.length < 1) {
			console.error(`Missed examples for arguments in command "${this.name}"`);
			process.exit(1);
		}

		if (this.client.config.runEnv === 'dev') {
			i18n.__({ locale: 'ru', phrase: `info.help.cmdDesc.${this.name.toLowerCase()}` });
		}

		this.createEmbed = client.messages.createEmbed.bind(client.messages);
		this.replyAsync = client.messages.sendReply.bind(client.messages);
		this.sendAsync = client.messages.sendEmbed.bind(client.messages);
		this.showPaginated = client.messages.showPaginated.bind(client.messages);
	}

	public async onLoaded() {
		// NO-OP
	}

	protected getDescription(t: TranslateFunc) {
		const desc = `info.help.cmdDesc.${this.name.toLowerCase()}`;

		return t(desc) === desc ? t('error.no') : t(desc);
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
