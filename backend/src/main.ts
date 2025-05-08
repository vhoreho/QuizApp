import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enhanced ValidationPipe configuration
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
      enableDebugMessages: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => {
          const constraints = error.constraints ? Object.values(error.constraints) : [];
          return {
            property: error.property,
            errors: constraints,
            children: error.children?.length
              ? `Has ${error.children.length} child errors`
              : undefined,
            value: error.value,
          };
        });
        console.error('Validation errors:', JSON.stringify(formattedErrors, null, 2));
        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  app.enableCors();

  const port = process.env.PORT || process.env.BACKEND_PORT || 3000;
  const host = process.env.HOST || 'localhost';

  await app.listen(port, host);

  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`Server started successfully at ${new Date().toISOString()}`);
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap', err);
  process.exit(1);
});
