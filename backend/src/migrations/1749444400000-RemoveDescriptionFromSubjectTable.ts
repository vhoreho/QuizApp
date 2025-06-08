import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDescriptionFromSubjectTable1749444400000
  implements MigrationInterface
{
  name = "RemoveDescriptionFromSubjectTable1749444400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Проверяем существование таблицы subject и колонки description
    const hasTable = await queryRunner.hasTable("subject");
    if (hasTable) {
      const hasColumn = await queryRunner.hasColumn("subject", "description");
      if (hasColumn) {
        await queryRunner.query(
          `ALTER TABLE "subject" DROP COLUMN "description"`
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Добавляем колонку обратно с дефолтным значением
    await queryRunner.query(
      `ALTER TABLE "subject" ADD COLUMN "description" character varying DEFAULT 'No description'`
    );
  }
}
