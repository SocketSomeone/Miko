'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class MigrateEnitity1595273418244 {
	constructor() {
		this.name = 'MigrateEnitity1595273418244';
	}
	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "jopa"`);
	}
	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "guild" ADD "jopa" integer NOT NULL`);
	}
}
exports.MigrateEnitity1595273418244 = MigrateEnitity1595273418244;
//# sourceMappingURL=1595273418244-MigrateEnitity.js.map
