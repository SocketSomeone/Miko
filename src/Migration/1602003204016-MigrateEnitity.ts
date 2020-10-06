import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateEnitity1602003204016 implements MigrationInterface {
	name = 'MigrateEnitity1602003204016';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "post" ("id" character varying NOT NULL, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`
		);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "ignoreChannels"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "modlog"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "mutedRole"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "currency"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "prices"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "autoMod"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "autoModIgnoreRoles"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "autoModIgnoreChannels"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "onWelcomeRoles"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "welcomeSaveRoles"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "welcomeChannelType"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "logger"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "punishmentConfig"`);
		await queryRunner.query(`ALTER TABLE "base_punishment" DROP COLUMN "args"`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "moderationMuterole" character varying DEFAULT null`);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "economyCurrency" character varying NOT NULL DEFAULT '<:miko_coins:735507574027190303>'`
		);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "economyTimely" bigint NOT NULL DEFAULT 50`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "economyStandart" bigint NOT NULL DEFAULT 150`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "autoModViolations" json NOT NULL DEFAULT '{}'`);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "autoModIgnoreroles" character varying array NOT NULL DEFAULT '{}'`
		);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "autoModIgnorechannels" character varying array NOT NULL DEFAULT '{}'`
		);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "autoModConfig" json NOT NULL DEFAULT '[]'`);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "welcomeRoles" character varying array NOT NULL DEFAULT '{}'`
		);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "welcomeSaveroles" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "welcomeChanneltype" integer DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "loggerEvents" json NOT NULL DEFAULT '{}'`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "loggerModer" character varying DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_punishment" ALTER COLUMN "reason" DROP NOT NULL`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "ownerID" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" SET DEFAULT null`);
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "base_shop_role" ALTER COLUMN "cost" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "name" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_guild" ALTER COLUMN "ownerID" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_punishment" ALTER COLUMN "reason" SET NOT NULL`);
		await queryRunner.query(`ALTER TABLE "base_member" ALTER COLUMN "money" SET DEFAULT 0`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeMessage" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "welcomeChannel" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" ALTER COLUMN "privateManager" DROP DEFAULT`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "loggerModer"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "loggerEvents"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "welcomeChanneltype"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "welcomeSaveroles"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "welcomeRoles"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "autoModConfig"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "autoModIgnorechannels"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "autoModIgnoreroles"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "autoModViolations"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "economyStandart"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "economyTimely"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "economyCurrency"`);
		await queryRunner.query(`ALTER TABLE "base_settings" DROP COLUMN "moderationMuterole"`);
		await queryRunner.query(`ALTER TABLE "base_punishment" ADD "args" json NOT NULL`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "punishmentConfig" json NOT NULL DEFAULT '[]'`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "logger" json NOT NULL DEFAULT '{}'`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "welcomeChannelType" integer`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "welcomeSaveRoles" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "onWelcomeRoles" character varying array NOT NULL DEFAULT '{}'`
		);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "autoModIgnoreChannels" character varying array NOT NULL DEFAULT '{}'`
		);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "autoModIgnoreRoles" character varying array NOT NULL DEFAULT '{}'`
		);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "autoMod" json NOT NULL DEFAULT '{}'`);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "prices" json NOT NULL DEFAULT '{"timely":"15","standart":"100"}'`
		);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "currency" character varying NOT NULL DEFAULT '<:miko_coins:735507574027190303>'`
		);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "mutedRole" character varying`);
		await queryRunner.query(`ALTER TABLE "base_settings" ADD "modlog" character varying`);
		await queryRunner.query(
			`ALTER TABLE "base_settings" ADD "ignoreChannels" character varying array NOT NULL DEFAULT '{}'`
		);
		await queryRunner.query(`DROP TABLE "post"`);
	}
}
