"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@miko/logger");
const framework_1 = require("@miko/framework");
const database_1 = require("@miko/database");
const modules = __importStar(require("./modules"));
const logger = new logger_1.Logger('ROOT');
const main = async () => {
    logger.log('Starting Miko instance!!');
    const client = new framework_1.MiClient(modules);
    logger.log('Connection to Database...');
    await database_1.createDatabase();
    logger.log('Initializing BOT login...');
    await client.login(process.env.TOKEN);
};
main().catch((err) => logger.error(err));
//# sourceMappingURL=index.js.map