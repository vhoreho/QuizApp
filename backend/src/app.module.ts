import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { QuizSystemModule } from './quiz-system/quiz-system.module';
import { RolesModule } from './roles/roles.module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'quizuser'),
        password: configService.get('DATABASE_PASSWORD', 'quizpassword'),
        database: configService.get('DATABASE_NAME', 'quizdb'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    UsersModule,
    AuthModule,
    QuizSystemModule,
    RolesModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

  async onModuleInit() {
    try {
      // Check if description column exists
      const queryRunner = this.dataSource.createQueryRunner();
      const hasDescriptionColumn = await queryRunner.hasColumn('subject', 'description');

      if (hasDescriptionColumn) {
        console.log('Removing description column from subject table...');
        await queryRunner.query('ALTER TABLE "subject" DROP COLUMN "description"');
        console.log('Successfully removed description column from subject table.');
      } else {
        console.log('Description column does not exist in subject table.');
      }

      await queryRunner.release();
    } catch (error) {
      console.error('Error removing description column:', error);
    }
  }
}
