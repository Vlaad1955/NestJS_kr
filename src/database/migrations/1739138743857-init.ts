import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1739138743857 implements MigrationInterface {
    name = 'Init1739138743857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar" character varying`);
    }

}
