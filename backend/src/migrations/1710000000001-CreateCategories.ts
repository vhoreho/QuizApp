import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategories1710000000001 implements MigrationInterface {
  name = 'CreateCategories1710000000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
            CREATE TABLE "category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "icon" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_category_name" UNIQUE ("name"),
                CONSTRAINT "PK_category" PRIMARY KEY ("id")
            )
        `);

    // Add category_id column to quiz table
    await queryRunner.query(`
            ALTER TABLE "quiz" 
            ADD COLUMN "category_id" integer NOT NULL,
            ADD CONSTRAINT "FK_quiz_category" 
            FOREIGN KEY ("category_id") 
            REFERENCES "category"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
            ALTER TABLE "quiz" 
            DROP CONSTRAINT "FK_quiz_category"
        `);

    // Remove category_id column
    await queryRunner.query(`
            ALTER TABLE "quiz" 
            DROP COLUMN "category_id"
        `);

    // Drop categories table
    await queryRunner.query(`DROP TABLE "category"`);
  }
} 