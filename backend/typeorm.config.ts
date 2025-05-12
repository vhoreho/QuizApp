import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'quizuser',
  password: process.env.DATABASE_PASSWORD || 'quizpassword',
  database: process.env.DATABASE_NAME || 'quizdb',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
}); 