import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuizCategory1710000000000 implements MigrationInterface {
  name = 'AddQuizCategory1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
            CREATE TYPE "public"."quiz_category_enum" AS ENUM (
                'programming', 'mathematics', 'science', 'languages', 
                'history', 'literature', 'other'
            )
        `);

    // Add new columns
    await queryRunner.query(`
            ALTER TABLE "quiz" 
            ADD COLUMN "category" "public"."quiz_category_enum" NOT NULL DEFAULT 'other',
            ADD COLUMN "time_limit" integer,
            ADD COLUMN "passing_score" integer
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns
    await queryRunner.query(`
            ALTER TABLE "quiz" 
            DROP COLUMN "category",
            DROP COLUMN "time_limit",
            DROP COLUMN "passing_score"
        `);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "public"."quiz_category_enum"`);
  }
} 