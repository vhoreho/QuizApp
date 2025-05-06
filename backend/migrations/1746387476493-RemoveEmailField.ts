import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEmailField1746387476493 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Удаляем колонку email из таблицы user
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Восстанавливаем колонку email в таблице user
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "email" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`);
    }

}
