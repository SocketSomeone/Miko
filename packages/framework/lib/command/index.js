"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiCommand = void 0;
const resolvers_1 = require("../resolvers");
class MiCommand {
    constructor({ args, ...opts }) {
        this.guards = [];
        this.resolvers = [];
        this.guildOnly = true;
        this.premiumOnly = false;
        this.botPermissions = [];
        this.userPermissions = [];
        Object.assign(this, opts);
        if (args) {
            args.map((arg) => {
                if (arg.resolver instanceof resolvers_1.MiResolver) {
                    this.resolvers.push(arg.resolver);
                }
                else {
                    this.resolvers.push(new arg.resolver());
                }
            });
        }
    }
    async startCommand() {
    }
}
exports.MiCommand = MiCommand;
//# sourceMappingURL=index.js.map