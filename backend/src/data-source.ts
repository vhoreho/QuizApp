import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load environment variables

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'quizapp',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
