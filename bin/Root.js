'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const chalk_1 = __importDefault(require('chalk'));
const Client_1 = require('./Client');
const typeorm_1 = require('typeorm');
const rawParams = process.argv.slice(2);
const args = rawParams.filter((a) => !a.startsWith('--'));
const flags = rawParams.filter((f) => f.startsWith('--'));
process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
const main = async () => {
	const client = new Client_1.BaseClient(args[0]);
	console.log(chalk_1.default.green('-------------------------------------'));
	console.log(chalk_1.default.green('Connection to Database...'));
	console.log(chalk_1.default.green('-------------------------------------'));
	await typeorm_1.createConnection();
	console.log(chalk_1.default.green('-------------------------------------'));
	console.log(chalk_1.default.green('Starting bot...'));
	console.log(chalk_1.default.green('-------------------------------------'));
	await client.init();
	console.log(chalk_1.default.green('-------------------------------------'));
	console.log(chalk_1.default.green('Connecting to discord...'));
	console.log(chalk_1.default.green('-------------------------------------'));
	await client.connect();
};
main().catch((err) => console.error(err));
//# sourceMappingURL=Root.js.map
