import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { QuizSystemModule } from "./quiz-system/quiz-system.module";
import { RolesModule } from "./roles/roles.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USER", "quizuser"),
        password: configService.get("DB_PASSWORD", "quizpassword"),
        database: configService.get("DB_NAME", "quizdb"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        migrations: [__dirname + "/migrations/**/*{.ts,.js}"],
        migrationsRun: true,
      }),
    }),
    UsersModule,
    AuthModule,
    QuizSystemModule,
    RolesModule,
  ],
})
export class AppModule {}
