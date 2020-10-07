import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEnitity1602102169387 implements MigrationInterface {
	name = 'MigrateEnitity1602102169387';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "base_settings" ("id" bigint NOT NULL, "prefix" character varying NOT NULL DEFAULT '!', "locale" character varying NOT NULL, "permissions" json NOT NULL DEFAULT '[]', "moderationMuterole" character varying DEFAULT null, "privateManager" character varying DEFAULT null, "economyCurrency" character varying NOT NULL DEFAULT '<:miko_coins:735507574027190303>', "economyTimely" bigint NOT NULL DEFAULT 50, "economyStandart" bigint NOT NULL DEFAULT 150, "autoModViolations" json NOT NULL DEFAULT '{}', "autoModIgnoreroles" character varying array NOT NULL DEFAULT '{}', "autoModIgnorechannels" character varying array NOT NULL DEFAULT '{}', "autoModConfig" json NOT NULL DEFAULT '[]', "welcomeEnabled" boolean NOT NULL DEFAULT false, "welcomeRoles" character varying array NOT NULL DEFAULT '{}', "welcomeSaveroles" boolean NOT NULL DEFAULT false, "welcomeChanneltype" integer DEFAULT null, "welcomeChannel" bigint DEFAULT null, "welcomeMessage" character varying DEFAULT null, "loggerEnabled" boolean NOT NULL DEFAULT false, "loggerEvents" json NOT NULL DEFAULT '{}', "loggerModer" character varying DEFAULT null, CONSTRAINT "PK_b626bce8ae626afe82fecc02141" PRIMARY KEY ("id"))`
		);
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
		await queryRunner.query(`DROP TABLE "base_settings"`);
	}
}
