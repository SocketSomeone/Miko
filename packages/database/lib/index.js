"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabase = void 0;
const typeorm_1 = require("typeorm");
const createDatabase = () => typeorm_1.createConnection({
    type: 'postgres',
    port: Number(process.env.TYPEORM_PORT),
    database: process.env.TYPEORM_DATABASE,
    host: process.env.TYPEORM_HOST,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    logging: process.env.TYPEORM_LOGGING === 'true'
});
exports.createDatabase = createDatabase;
//# sourceMappingURL=index.js.map