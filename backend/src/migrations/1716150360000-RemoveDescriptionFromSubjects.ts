import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDescriptionFromSubjects1716150360000
  implements MigrationInterface
{
  name = "RemoveDescriptionFromSubjects1716150360000";

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
    await queryRunner.query(
      `ALTER TABLE "subject" ADD "description" character varying NOT NULL DEFAULT 'No description'`
    );
  }
}
