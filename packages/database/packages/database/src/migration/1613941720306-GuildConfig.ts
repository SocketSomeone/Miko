import {MigrationInterface, QueryRunner} from "typeorm";

export class GuildConfig1613941720306 implements MigrationInterface {
    name = 'GuildConfig1613941720306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "guild_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "guild_id" bigint NOT NULL, "name" character varying NOT NULL, "icon_url" character varying NOT NULL, "prefix" character varying NOT NULL, "locale" character varying NOT NULL, CONSTRAINT "PK_f65dc70240f2caa6b44d6abe85f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "guild_config"`);
    }

}
