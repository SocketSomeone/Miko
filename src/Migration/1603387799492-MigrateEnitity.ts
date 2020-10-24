import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEnitity1603387799492 implements MigrationInterface {
	name = 'MigrateEnitity1603387799492';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "base_settings" RENAME COLUMN "permissions" TO "deleteMessageAfter"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "deleteMessageAfter"`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "deleteMessageAfter" integer NOT NULL DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "moderationMuterole" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChanneltype" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "loggerModer" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "ownerID" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "ownerID" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "loggerModer" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChanneltype" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "moderationMuterole" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "deleteMessageAfter"`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "deleteMessageAfter" json NOT NULL DEFAULT '[]'`);
		await queryRunner.query(`ALTER TABLE "base_settings" RENAME COLUMN "deleteMessageAfter" TO "permissions"`);
	}
}
