import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Create logger instance
  const logger = new Logger('Bootstrap');

  try {
    // Create the application with logging configuration
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);

    // Enable CORS with credentials
    app.enableCors({
      origin: configService.get('FRONTEND_URL') || 'http://localhost:5173',
      credentials: true,
    });

    // Enable cookie parsing
    app.use(cookieParser());

    const port = configService.get('PORT') || 3000;
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
