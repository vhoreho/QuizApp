import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorLog } from './entities/error-log.entity';
import { CreateErrorLogDto } from './dto/create-error-log.dto';
import { LoggerService } from '../logger.service';

@Injectable()
export class LoggerErrorService {
  private batchLogs: CreateErrorLogDto[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_INTERVAL = 10000; // 10 секунд
  private readonly MAX_BATCH_SIZE = 20;

  constructor(
    @InjectRepository(ErrorLog)
    private errorLogRepository: Repository<ErrorLog>,
    private logger: LoggerService,
  ) {
    this.logger.setContext('LoggerErrorService');
  }

  async logError(errorLogDto: CreateErrorLogDto): Promise<void> {
    try {
      // Проверка на дублирование ошибки за последние 24 часа
      const existingLog = await this.errorLogRepository.findOne({
        where: {
          errorMessage: errorLogDto.errorMessage,
          source: errorLogDto.source,
        },
        order: { timestamp: 'DESC' },
      });

      if (existingLog && this.isWithin24Hours(existingLog.timestamp)) {
        // Увеличиваем счетчик вхождений
        await this.errorLogRepository.update(existingLog.id, {
          occurrences: existingLog.occurrences + 1,
          // Обновляем метаданные только если они предоставлены
          ...(errorLogDto.metadata && { metadata: errorLogDto.metadata }),
        });
      } else {
        // Создаем новую запись
        const errorLog = this.errorLogRepository.create(errorLogDto);
        await this.errorLogRepository.save(errorLog);
      }
    } catch (error) {
      this.logger.error(`Failed to log error: ${error.message}`);
    }
  }

  async logErrorBatch(errorLogDto: CreateErrorLogDto): Promise<void> {
    this.batchLogs.push(errorLogDto);

    if (this.batchLogs.length >= this.MAX_BATCH_SIZE) {
      this.flushBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushBatch(), this.BATCH_INTERVAL);
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.batchLogs.length === 0) {
      return;
    }

    const logsCopy = [...this.batchLogs];
    this.batchLogs = [];

    try {
      // Обрабатываем логи пакетом
      await Promise.all(logsCopy.map(log => this.logError(log)));
    } catch (error) {
      this.logger.error(`Failed to flush error log batch: ${error.message}`);
    }
  }

  private isWithin24Hours(date: Date): boolean {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return date > oneDayAgo;
  }

  // Метод для очистки старых логов (можно вызывать через cron)
  async cleanOldLogs(daysToKeep = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await this.errorLogRepository.delete({
        timestamp: {
          $lt: cutoffDate
        } as any,
      });
    } catch (error) {
      this.logger.error(`Failed to clean old logs: ${error.message}`);
    }
  }
} 