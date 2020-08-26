import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEnitity1598414863907 implements MigrationInterface {
	name = 'MigrateEnitity1598414863907';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "base_private" DROP COLUMN "createdAt"`);
		await queryRunner.query(`ALTER TABLE "base_guild" ADD "deletedAt" TIMESTAMP`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "modlog" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "mutedRole" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannelType" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "owner" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "joinedAt" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "joinedAt" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "joinedAt" SET DEFAULT now()`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "joinedAt" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "owner" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannelType" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "mutedRole" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "modlog" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_guild" DROP COLUMN "deletedAt"`);
		await queryRunner.query(`ALTER TABLE "base_private" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
	}
}
