import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();

  const port = process.env.PORT || process.env.BACKEND_PORT || 3000;
  const host = process.env.HOST || 'localhost';

  await app.listen(port, host);

  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`Server started successfully at ${new Date().toISOString()}`);
}
bootstrap().catch(err => {
  console.error('Error during application bootstrap', err);
  process.exit(1);
}); 