import { Controller, Get } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Controller()
export class AppController {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(AppController.name);
  }

  @Get()
  healthCheck() {
    this.logger.log('Health check endpoint called');
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('test-logs')
  testLogs() {
    this.logger.log('This is an info level log');
    this.logger.error('This is an error level log', new Error('Test error').stack);
    this.logger.warn('This is a warning level log');
    this.logger.debug('This is a debug level log');
    this.logger.verbose('This is a verbose level log');

    return {
      message: 'Test logs have been generated',
      timestamp: new Date().toISOString()
    };
  }
} 