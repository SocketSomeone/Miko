import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEnitity1598415908989 implements MigrationInterface {
	name = 'MigrateEnitity1598415908989';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "base_guild" DROP COLUMN "size"`);
		await queryRunner.query(`ALTER TABLE "base_guild" DROP COLUMN "owner"`);
		await queryRunner.query(`ALTER TABLE "base_guild" ADD "ownerID" character varying DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_guild" ADD "memberCount" integer NOT NULL DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "modlog" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "mutedRole" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannelType" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannelType" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "mutedRole" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "modlog" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_guild" DROP COLUMN "memberCount"`);
		await queryRunner.query(`ALTER TABLE "base_guild" DROP COLUMN "ownerID"`);
		await queryRunner.query(`ALTER TABLE "base_guild" ADD "owner" character varying`);
		await queryRunner.query(`ALTER TABLE "base_guild" ADD "size" integer NOT NULL DEFAULT 0`);
	}
}
