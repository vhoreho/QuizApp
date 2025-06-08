import { MigrationInterface, QueryRunner } from "typeorm";

export class ReplaceCategoryWithSubject1747422033198 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Создаем новую таблицу subject
        await queryRunner.query(`
            CREATE TABLE "subject" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "icon" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_subject_name" UNIQUE ("name"),
                CONSTRAINT "PK_subject" PRIMARY KEY ("id")
            )
        `);

        // 2. Копируем данные из category в subject
        await queryRunner.query(`
            INSERT INTO "subject" ("name", "description", "icon", "createdAt", "updatedAt")
            SELECT "name", "description", "icon", "createdAt", "updatedAt" FROM "category"
        `);

        // 3. Создаем временную колонку subjectId в таблице quiz
        await queryRunner.query(`
            ALTER TABLE "quiz" ADD COLUMN "subjectId" integer
        `);

        // 4. Обновляем subjectId на основе categoryId
        await queryRunner.query(`
            UPDATE "quiz" SET "subjectId" = 
            (SELECT "id" FROM "subject" WHERE "subject"."name" = 
                (SELECT "name" FROM "category" WHERE "category"."id" = "quiz"."categoryId"))
        `);

        // 5. Делаем subjectId NOT NULL
        await queryRunner.query(`
            ALTER TABLE "quiz" ALTER COLUMN "subjectId" SET NOT NULL
        `);

        // 6. Проверяем наличие внешнего ключа перед его удалением
        const hasConstraint = await queryRunner.hasColumn("quiz", "categoryId");
        if (hasConstraint) {
            try {
                // Проверяем существование ограничения FK_quiz_category
                const constraintExists = await queryRunner.query(`
                    SELECT constraint_name 
                    FROM information_schema.table_constraints 
                    WHERE table_name = 'quiz' 
                    AND constraint_name = 'FK_quiz_category'
                `);

                if (constraintExists && constraintExists.length > 0) {
                    await queryRunner.query(`
                        ALTER TABLE "quiz" DROP CONSTRAINT "FK_quiz_category"
                    `);
                }
            } catch (error) {
                console.log('Ограничение FK_quiz_category не найдено, пропускаем удаление', error);
            }
        }

        // 7. Добавляем внешний ключ для subjectId
        await queryRunner.query(`
            ALTER TABLE "quiz" 
            ADD CONSTRAINT "FK_quiz_subject" 
            FOREIGN KEY ("subjectId") 
            REFERENCES "subject"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        // 8. Удаляем колонку categoryId
        await queryRunner.query(`
            ALTER TABLE "quiz" DROP COLUMN "categoryId"
        `);

        // 9. Удаляем таблицу category
        await queryRunner.query(`
            DROP TABLE "category"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Создаем таблицу category обратно
        await queryRunner.query(`
            CREATE TABLE "category" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "icon" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_category_name" UNIQUE ("name"),
                CONSTRAINT "PK_category" PRIMARY KEY ("id")
            )
        `);

        // 2. Копируем данные из subject в category
        await queryRunner.query(`
            INSERT INTO "category" ("name", "description", "icon", "createdAt", "updatedAt")
            SELECT "name", "description", "icon", "createdAt", "updatedAt" FROM "subject"
        `);

        // 3. Добавляем колонку categoryId в таблицу quiz
        await queryRunner.query(`
            ALTER TABLE "quiz" ADD COLUMN "categoryId" integer
        `);

        // 4. Обновляем categoryId на основе subjectId
        await queryRunner.query(`
            UPDATE "quiz" SET "categoryId" = 
            (SELECT "id" FROM "category" WHERE "category"."name" = 
                (SELECT "name" FROM "subject" WHERE "subject"."id" = "quiz"."subjectId"))
        `);

        // 5. Делаем categoryId NOT NULL
        await queryRunner.query(`
            ALTER TABLE "quiz" ALTER COLUMN "categoryId" SET NOT NULL
        `);

        // 6. Проверяем наличие внешнего ключа перед его удалением
        const hasConstraint = await queryRunner.hasColumn("quiz", "subjectId");
        if (hasConstraint) {
            try {
                // Проверяем существование ограничения FK_quiz_subject
                const constraintExists = await queryRunner.query(`
                    SELECT constraint_name 
                    FROM information_schema.table_constraints 
                    WHERE table_name = 'quiz' 
                    AND constraint_name = 'FK_quiz_subject'
                `);

                if (constraintExists && constraintExists.length > 0) {
                    await queryRunner.query(`
                        ALTER TABLE "quiz" DROP CONSTRAINT "FK_quiz_subject"
                    `);
                }
            } catch (error) {
                console.log('Ограничение FK_quiz_subject не найдено, пропускаем удаление', error);
            }
        }

        // 7. Добавляем внешний ключ для categoryId
        await queryRunner.query(`
            ALTER TABLE "quiz" 
            ADD CONSTRAINT "FK_quiz_category" 
            FOREIGN KEY ("categoryId") 
            REFERENCES "category"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        // 8. Удаляем колонку subjectId
        await queryRunner.query(`
            ALTER TABLE "quiz" DROP COLUMN "subjectId"
        `);

        // 9. Удаляем таблицу subject
        await queryRunner.query(`
            DROP TABLE "subject"
        `);
    }
}
