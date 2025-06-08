import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

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
      timestamp: new Date().toISOString(),
    };
  }
}
