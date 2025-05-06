import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './logger/filters/all-exceptions.filter';
import { LoggerErrorService } from './logger/logger-error.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  // Enhanced ValidationPipe configuration
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false,
    enableDebugMessages: true,
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map(error => {
        const constraints = error.constraints ? Object.values(error.constraints) : [];
        return {
          property: error.property,
          errors: constraints,
          children: error.children?.length ? `Has ${error.children.length} child errors` : undefined,
          value: error.value
        };
      });
      logger.error(`Validation errors: ${JSON.stringify(formattedErrors)}`);
      console.error('Validation errors:', JSON.stringify(formattedErrors, null, 2));
      return new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
  }));

  // Регистрируем глобальный фильтр исключений для логирования ошибок
  const loggerErrorService = app.get(LoggerErrorService);
  app.useGlobalFilters(new AllExceptionsFilter(loggerErrorService));

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