import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ErrorLog } from './entities/error-log.entity';
import { LoggerErrorService } from './logger-error.service';
import { LoggerController } from './logger.controller';
import { LoggerService } from '../logger.service';
import { LoggerCleanupCron } from './logger-cleanup.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorLog]),
    ScheduleModule.forRoot(),
  ],
  providers: [LoggerErrorService, LoggerService, LoggerCleanupCron],
  controllers: [LoggerController],
  exports: [LoggerErrorService],
})
export class LoggerErrorModule { } 