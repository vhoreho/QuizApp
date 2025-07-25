import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUserIdColumn1747235717251 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Проверяем существование колонки user_id перед удалением
        const hasUserIdColumn = await queryRunner.hasColumn('result', 'user_id');
        if (hasUserIdColumn) {
            await queryRunner.dropColumn('result', 'user_id');
        }

        // Проверяем существование колонки quiz_id перед удалением
        const hasQuizIdColumn = await queryRunner.hasColumn('result', 'quiz_id');
        if (hasQuizIdColumn) {
            await queryRunner.dropColumn('result', 'quiz_id');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Восстанавливаем колонку user_id если нужно будет откатить миграцию
        const hasUserIdColumn = await queryRunner.hasColumn('result', 'user_id');
        if (!hasUserIdColumn) {
            await queryRunner.query(`ALTER TABLE "result" ADD "user_id" integer NOT NULL`);
        }

        // Восстанавливаем колонку quiz_id если нужно будет откатить миграцию
        const hasQuizIdColumn = await queryRunner.hasColumn('result', 'quiz_id');
        if (!hasQuizIdColumn) {
            await queryRunner.query(`ALTER TABLE "result" ADD "quiz_id" integer NOT NULL`);
        }
    }

}
