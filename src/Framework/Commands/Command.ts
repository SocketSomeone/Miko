import { BaseClient } from '../../Client';
import { Guild, Member, Message } from 'eris';
import { GuildPermission } from '../../Misc/Enums/GuildPermissions';
import { CommandGroup } from '../../Misc/Enums/Commands';
import { Resolver, ResolverConstructor } from '../Resolvers/Resolver';
import { GuildSettings } from '../../Misc/Models/GuildSetting';

interface Arg {
	name: string;
	resolver: Resolver | ResolverConstructor;
	required?: boolean;
	rest?: boolean;
}

export type Context = {
	guild: Guild;
	me: Member;
	t: (key: string, replacements?: { [key: string]: any }) => string;
	settings: GuildSettings;
	isPremium: boolean;
};

interface CommandOptions {
	name: string /* TODO: enum */;
	aliases: string[];
	args?: Arg[];
	group: CommandGroup;

	guildOnly: boolean;
	adminOnly?: boolean;
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

	public strict: boolean;
	public guildOnly: boolean;
	public botPermissions?: GuildPermission[];
	public userPermissions?: GuildPermission[];
	public premiumOnly?: boolean;

	public constructor(client: BaseClient, props: CommandOptions) {
		this.client = client;

		this.name = props.name;
		this.aliases = props.aliases.map((x) => x.toLowerCase());
		this.args = (props && props.args) || [];
		this.group = props.group;
		this.usage = `{prefix}${this.name}`;

		this.botPermissions = (props && props.botPermissions) || [];
		this.userPermissions = (props && props.userPermissions) || [];

		this.guildOnly = props.guildOnly;
		this.premiumOnly = props.premiumOnly;
		this.strict = (props && props.adminOnly) || false;

		this.resolvers = [];

		this.args.map((arg) => {
			if (arg.resolver instanceof Resolver) {
				this.resolvers.push(arg.resolver);
			} else {
				this.resolvers.push(new arg.resolver(this.client));
			}

			delete arg.resolver;

			this.usage += arg.required ? `[${arg.name}] ` : `${arg.name} `;
		});
	}

	public abstract execute(message: Message, args: any[], context: Context): any;
}
