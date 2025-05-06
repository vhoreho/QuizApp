import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggerErrorService } from '../logger-error.service';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly loggerErrorService: LoggerErrorService) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    // Логируем ошибку
    this.loggerErrorService.logErrorBatch({
      errorMessage,
      stackTrace: exception instanceof Error ? exception.stack : undefined,
      source: 'backend',
      userId: request.user && 'id' in request.user ? (request.user as any).id : undefined,
      url: request.url,
      metadata: {
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
        statusCode: status,
      },
    });

    // Возвращаем ответ клиенту
    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
} 