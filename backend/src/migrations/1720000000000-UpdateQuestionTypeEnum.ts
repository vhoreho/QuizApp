import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateQuestionTypeEnum1720000000000 implements MigrationInterface {
  name = "UpdateQuestionTypeEnum1720000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table has data before proceeding
    const tableExists = await queryRunner.hasTable("question");

    if (tableExists) {
      // Check if table has any rows
      const count = await queryRunner.query(`SELECT COUNT(*) FROM "question"`);
      const hasData = count[0].count > 0;

      if (hasData) {
        // Create a backup of the question table
        await queryRunner.query(
          `CREATE TABLE "question_backup" AS SELECT * FROM "question"`
        );
      }

      // Drop foreign key constraints that reference the question table
      await queryRunner.query(
        `ALTER TABLE "answer" DROP CONSTRAINT "FK_answer_question"`
      );

      // Drop the question table
      await queryRunner.query(`DROP TABLE "question"`);

      // Drop the enum type with CASCADE
      await queryRunner.query(
        `DROP TYPE "public"."question_type_enum" CASCADE`
      );

      // Create the new enum type with uppercase values
      await queryRunner.query(`
        CREATE TYPE "public"."question_type_enum" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'MATCHING', 'TRUE_FALSE')
      `);

      // Recreate the question table with the same structure but using the new enum
      await queryRunner.query(`
        CREATE TABLE "question" (
          "id" SERIAL NOT NULL,
          "quizId" integer NOT NULL,
          "text" character varying NOT NULL,
          "type" "public"."question_type_enum" NOT NULL DEFAULT 'SINGLE_CHOICE',
          "options" json DEFAULT '[]',
          "correctAnswers" json DEFAULT '[]',
          "points" integer,
          "order" integer NOT NULL DEFAULT 0,
          CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id")
        )
      `);

      if (hasData) {
        // Insert data from backup with converted enum values
        await queryRunner.query(`
          INSERT INTO "question" ("id", "quizId", "text", "options", "correctAnswers", "points", "order")
          SELECT "id", "quizId", "text", "options", "correctAnswers", "points", "order"
          FROM "question_backup"
        `);

        // Update the type column with converted values
        await queryRunner.query(`
          UPDATE "question" q
          SET "type" = 
            CASE 
              WHEN qb."type"::text = 'single_choice' THEN 'SINGLE_CHOICE'
              WHEN qb."type"::text = 'multiple_choice' THEN 'MULTIPLE_CHOICE'
              WHEN qb."type"::text = 'matching' THEN 'MATCHING'
              WHEN qb."type"::text = 'open_ended' THEN 'TRUE_FALSE'
              ELSE 'SINGLE_CHOICE'
            END::"public"."question_type_enum"
          FROM "question_backup" qb
          WHERE q."id" = qb."id"
        `);

        // Drop the backup table
        await queryRunner.query(`DROP TABLE "question_backup"`);
      }

      // Recreate foreign key constraints
      await queryRunner.query(`
        ALTER TABLE "question" 
        ADD CONSTRAINT "FK_question_quiz" 
        FOREIGN KEY ("quizId") 
        REFERENCES "quiz"("id") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION
      `);

      await queryRunner.query(`
        ALTER TABLE "answer" 
        ADD CONSTRAINT "FK_answer_question" 
        FOREIGN KEY ("questionId") 
        REFERENCES "question"("id") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create a backup of the question table
    await queryRunner.query(
      `CREATE TABLE "question_backup" AS SELECT * FROM "question"`
    );

    // Drop foreign key constraints that reference the question table
    await queryRunner.query(
      `ALTER TABLE "answer" DROP CONSTRAINT "FK_answer_question"`
    );

    // Drop the question table
    await queryRunner.query(`DROP TABLE "question"`);

    // Drop the enum type with CASCADE
    await queryRunner.query(`DROP TYPE "public"."question_type_enum" CASCADE`);

    // Create the old enum type with lowercase values
    await queryRunner.query(`
      CREATE TYPE "public"."question_type_enum" AS ENUM('single_choice', 'multiple_choice', 'matching', 'open_ended')
    `);

    // Recreate the question table with the same structure but using the old enum
    await queryRunner.query(`
      CREATE TABLE "question" (
        "id" SERIAL NOT NULL,
        "quizId" integer NOT NULL,
        "text" character varying NOT NULL,
        "type" "public"."question_type_enum" NOT NULL DEFAULT 'single_choice',
        "options" json DEFAULT '[]',
        "correctAnswers" json DEFAULT '[]',
        "points" integer,
        "order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id")
      )
    `);

    // Insert data from backup with converted enum values
    await queryRunner.query(`
      INSERT INTO "question" ("id", "quizId", "text", "options", "correctAnswers", "points", "order")
      SELECT "id", "quizId", "text", "options", "correctAnswers", "points", "order"
      FROM "question_backup"
    `);

    // Update the type column with converted values
    await queryRunner.query(`
      UPDATE "question" q
      SET "type" = 
        CASE 
          WHEN qb."type" = 'SINGLE_CHOICE' THEN 'single_choice'
          WHEN qb."type" = 'MULTIPLE_CHOICE' THEN 'multiple_choice'
          WHEN qb."type" = 'MATCHING' THEN 'matching'
          WHEN qb."type" = 'TRUE_FALSE' THEN 'open_ended'
          ELSE 'single_choice'
        END::"public"."question_type_enum"
      FROM "question_backup" qb
      WHERE q."id" = qb."id"
    `);

    // Recreate foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "question" 
      ADD CONSTRAINT "FK_question_quiz" 
      FOREIGN KEY ("quizId") 
      REFERENCES "quiz"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "answer" 
      ADD CONSTRAINT "FK_answer_question" 
      FOREIGN KEY ("questionId") 
      REFERENCES "question"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Drop the backup table
    await queryRunner.query(`DROP TABLE "question_backup"`);
  }
}
