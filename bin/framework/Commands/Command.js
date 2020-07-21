'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Command = void 0;
const Resolver_1 = require('../Resolvers/Resolver');
class Command {
	constructor(client, props) {
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
			if (arg.resolver instanceof Resolver_1.Resolver) {
				this.resolvers.push(arg.resolver);
			} else {
				this.resolvers.push(new arg.resolver(this.client));
			}
			delete arg.resolver;
			this.usage += arg.required ? `[${arg.name}] ` : `${arg.name} `;
		});
	}
}
exports.Command = Command;
//# sourceMappingURL=Command.js.map
