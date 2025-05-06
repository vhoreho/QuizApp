import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { ResultsModule } from './results/results.module';
import { LoggerModule } from 'nestjs-pino';
import { LoggerModule as AppLoggerModule } from './logger.module';
import { LoggerErrorModule } from './logger/logger.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                  levelFirst: true,
                },
              },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
      }),
    }),
    AppLoggerModule,
    LoggerErrorModule,
    UsersModule,
    QuizzesModule,
    QuestionsModule,
    AnswersModule,
    ResultsModule,
    AuthModule,
    AdminModule,
    TeacherModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { } 