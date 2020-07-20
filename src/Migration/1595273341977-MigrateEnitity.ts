import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEnitity1595273341977 implements MigrationInterface {
	name = 'MigrateEnitity1595273341977';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "guild" ADD "jopa" integer NOT NULL`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "guild" DROP COLUMN "jopa"`);
	}
}
