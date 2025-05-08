import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCategoryIconToNullable1746646855705 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "icon" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "icon" SET NOT NULL`);
    }

}
