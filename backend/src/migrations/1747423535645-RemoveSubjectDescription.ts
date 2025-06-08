import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveSubjectDescription1747423535645 implements MigrationInterface {
    name = 'RemoveSubjectDescription1747423535645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP CONSTRAINT "FK_quiz_subject"`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD CONSTRAINT "FK_51ef827d0bf4efecd202aab034c" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP CONSTRAINT "FK_51ef827d0bf4efecd202aab034c"`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD CONSTRAINT "FK_quiz_subject" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
