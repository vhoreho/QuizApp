import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerErrorService } from './logger-error.service';
import { LoggerService } from '../logger.service';

@Injectable()
export class LoggerCleanupCron {
  constructor(
    private readonly loggerErrorService: LoggerErrorService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('LoggerCleanupCron');
  }

  // Запускаем ежедневно в 3:00 AM
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleLogCleanup() {
    try {
      this.logger.log('Starting error logs cleanup task');
      await this.loggerErrorService.cleanOldLogs(30); // Сохраняем логи за последние 30 дней
      this.logger.log('Error logs cleanup completed successfully');
    } catch (error) {
      this.logger.error(`Failed to clean up error logs: ${error.message}`);
    }
  }
} 