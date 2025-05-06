import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQuestionArrayColumns1721409580123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, create temporary columns with JSON type
    await queryRunner.query(`ALTER TABLE "question" ADD "options_json" jsonb`);
    await queryRunner.query(`ALTER TABLE "question" ADD "correct_answers_json" jsonb`);

    // Copy data from simple-array columns to JSON columns, handling array conversion
    await queryRunner.query(`
            UPDATE "question" 
            SET 
                "options_json" = 
                    CASE 
                        WHEN "options" IS NULL THEN '[]'::jsonb
                        ELSE to_jsonb(string_to_array("options", ','))
                    END,
                "correct_answers_json" = 
                    CASE 
                        WHEN "correctAnswers" IS NULL THEN '[]'::jsonb
                        ELSE to_jsonb(string_to_array("correctAnswers", ','))
                    END
        `);

    // Drop old columns
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "options"`);
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "correctAnswers"`);

    // Rename new columns to original names
    await queryRunner.query(`ALTER TABLE "question" RENAME COLUMN "options_json" TO "options"`);
    await queryRunner.query(`ALTER TABLE "question" RENAME COLUMN "correct_answers_json" TO "correctAnswers"`);

    // Set default values for the columns
    await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "options" SET DEFAULT '[]'`);
    await queryRunner.query(`ALTER TABLE "question" ALTER COLUMN "correctAnswers" SET DEFAULT '[]'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First, create temporary simple-array columns
    await queryRunner.query(`ALTER TABLE "question" ADD "options_array" text`);
    await queryRunner.query(`ALTER TABLE "question" ADD "correct_answers_array" text`);

    // Copy data from JSON columns to simple-array columns
    await queryRunner.query(`
            UPDATE "question" 
            SET 
                "options_array" = 
                    CASE 
                        WHEN "options" IS NULL THEN NULL
                        ELSE array_to_string("options"::text[], ',')
                    END,
                "correct_answers_array" = 
                    CASE 
                        WHEN "correctAnswers" IS NULL THEN NULL
                        ELSE array_to_string("correctAnswers"::text[], ',')
                    END
        `);

    // Drop JSON columns
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "options"`);
    await queryRunner.query(`ALTER TABLE "question" DROP COLUMN "correctAnswers"`);

    // Rename simple-array columns back to original names
    await queryRunner.query(`ALTER TABLE "question" RENAME COLUMN "options_array" TO "options"`);
    await queryRunner.query(`ALTER TABLE "question" RENAME COLUMN "correct_answers_array" TO "correctAnswers"`);
  }
} 