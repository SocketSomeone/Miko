import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEnitity1595273418244 implements MigrationInterface {
	name = 'MigrateEnitity1595273418244';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "jopa"`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "guild" ADD "jopa" integer NOT NULL`);
	}
}
