import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  constructor(
    @InjectPinoLogger(LoggerService.name)
    private readonly logger: PinoLogger
  ) { }

  setContext(context: string) {
    this.logger.setContext(context);
  }

  log(message: string, context?: string) {
    if (context) {
      this.logger.setContext(context);
    }
    this.logger.info(message);
  }

  error(message: string, trace?: string, context?: string) {
    if (context) {
      this.logger.setContext(context);
    }
    this.logger.error({ trace }, message);
  }

  warn(message: string, context?: string) {
    if (context) {
      this.logger.setContext(context);
    }
    this.logger.warn(message);
  }

  debug(message: string, context?: string) {
    if (context) {
      this.logger.setContext(context);
    }
    this.logger.debug(message);
  }

  verbose(message: string, context?: string) {
    if (context) {
      this.logger.setContext(context);
    }
    this.logger.trace(message);
  }
} 