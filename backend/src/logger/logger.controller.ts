import { Controller, Post, Body, SetMetadata } from '@nestjs/common';
import { CreateErrorLogDto } from './dto/create-error-log.dto';
import { LoggerErrorService } from './logger-error.service';

// Создаем локальную версию декоратора
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('logs')
export class LoggerController {
  constructor(private readonly loggerErrorService: LoggerErrorService) { }

  @Post()
  @Public() // Разрешаем логирование без аутентификации
  async createErrorLog(@Body() createErrorLogDto: CreateErrorLogDto) {
    await this.loggerErrorService.logErrorBatch(createErrorLogDto);
    return { success: true, message: 'Error logged successfully' };
  }
} 