'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.MigrateEnitity1595273294087 = void 0;
class MigrateEnitity1595273294087 {
	constructor() {
		this.name = 'MigrateEnitity1595273294087';
	}
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "guild" ADD "jopa" integer NOT NULL`);
	}
	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "jopa"`);
	}
}
exports.MigrateEnitity1595273294087 = MigrateEnitity1595273294087;
//# sourceMappingURL=1595273294087-MigrateEnitity.js.map
