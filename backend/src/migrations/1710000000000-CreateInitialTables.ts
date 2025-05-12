import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1710000000000 implements MigrationInterface {
  name = 'CreateInitialTables1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for user roles
    await queryRunner.query(`
            CREATE TYPE "public"."user_role_enum" AS ENUM('administrator', 'teacher', 'student')
        `);

    // Create enum type for question types
    await queryRunner.query(`
            CREATE TYPE "public"."question_type_enum" AS ENUM('single_choice', 'multiple_choice', 'matching', 'open_ended')
        `);

    // Create users table
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "username" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."user_role_enum" NOT NULL DEFAULT 'student',
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);

    // Create categories table
    await queryRunner.query(`
            CREATE TABLE "category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "icon" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"),
                CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")
            )
        `);

    // Create quizzes table
    await queryRunner.query(`
            CREATE TABLE "quiz" (
                "id" SERIAL NOT NULL,
                "title" character varying NOT NULL,
                "description" character varying NOT NULL,
                "categoryId" integer NOT NULL,
                "timeLimit" integer,
                "passingScore" integer,
                "createdById" integer NOT NULL,
                "isPublished" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_422d974e7217414e029b3e641d8" PRIMARY KEY ("id")
            )
        `);

    // Create questions table
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

    // Create answers table
    await queryRunner.query(`
            CREATE TABLE "answer" (
                "id" SERIAL NOT NULL,
                "questionId" integer NOT NULL,
                "userId" integer NOT NULL,
                "selectedAnswer" character varying,
                "selectedAnswers" text,
                "matchingPairs" json,
                "isCorrect" boolean NOT NULL DEFAULT false,
                "partialScore" double precision NOT NULL DEFAULT 0,
                CONSTRAINT "PK_9232db17b63fb1e94f97e5c224f" PRIMARY KEY ("id")
            )
        `);

    // Create results table
    await queryRunner.query(`
            CREATE TABLE "result" (
                "id" SERIAL NOT NULL,
                "userId" integer NOT NULL,
                "quizId" integer NOT NULL,
                "score" double precision NOT NULL,
                "correctAnswers" integer NOT NULL DEFAULT 0,
                "totalQuestions" integer NOT NULL DEFAULT 0,
                "totalPoints" double precision NOT NULL DEFAULT 0,
                "maxPossiblePoints" double precision NOT NULL DEFAULT 0,
                "isPractice" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_c93b145f3c2e95f6bf26fce7f16" PRIMARY KEY ("id")
            )
        `);

    // Add foreign key constraints
    await queryRunner.query(`
            ALTER TABLE "quiz" 
            ADD CONSTRAINT "FK_quiz_category" 
            FOREIGN KEY ("categoryId") 
            REFERENCES "category"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "quiz" 
            ADD CONSTRAINT "FK_quiz_user" 
            FOREIGN KEY ("createdById") 
            REFERENCES "user"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

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

    await queryRunner.query(`
            ALTER TABLE "answer" 
            ADD CONSTRAINT "FK_answer_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "result" 
            ADD CONSTRAINT "FK_result_user" 
            FOREIGN KEY ("userId") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "result" 
            ADD CONSTRAINT "FK_result_quiz" 
            FOREIGN KEY ("quizId") 
            REFERENCES "quiz"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "result" DROP CONSTRAINT "FK_result_quiz"`);
    await queryRunner.query(`ALTER TABLE "result" DROP CONSTRAINT "FK_result_user"`);
    await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_answer_user"`);
    await queryRunner.query(`ALTER TABLE "answer" DROP CONSTRAINT "FK_answer_question"`);
    await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_question_quiz"`);
    await queryRunner.query(`ALTER TABLE "quiz" DROP CONSTRAINT "FK_quiz_user"`);
    await queryRunner.query(`ALTER TABLE "quiz" DROP CONSTRAINT "FK_quiz_category"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "result"`);
    await queryRunner.query(`DROP TABLE "answer"`);
    await queryRunner.query(`DROP TABLE "question"`);
    await queryRunner.query(`DROP TABLE "quiz"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "user"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."question_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
} 