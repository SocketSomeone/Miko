'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MigrateEnitity1595273341977 = void 0;
class MigrateEnitity1595273341977 {
	constructor() {
		this.name = 'MigrateEnitity1595273341977';
	}
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "guild" ADD "jopa" integer NOT NULL`);
	}
	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "jopa"`);
	}
}
exports.MigrateEnitity1595273341977 = MigrateEnitity1595273341977;
//# sourceMappingURL=1595273341977-MigrateEnitity.js.map
