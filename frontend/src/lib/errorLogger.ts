import api from '../api/axiosConfig';

interface ErrorLogData {
  errorMessage: string;
  stackTrace?: string;
  source: 'frontend';
  userId?: number;
  url?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private queue: ErrorLogData[] = [];
  private isProcessing = false;
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly MIN_INTERVAL = 2000; // 2 секунды между отправками
  private readonly MAX_QUEUE_SIZE = 10;
  private readonly BATCH_TIMEOUT = 5000; // 5 секунд ожидания перед пакетной отправкой

  private constructor() {
    window.addEventListener('unload', () => this.flushQueue());
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public logError(error: Error | string, metadata?: Record<string, any>): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    // Получаем текущего пользователя из localStorage, если есть
    const userIdStr = localStorage.getItem('userId');
    const userId = userIdStr ? parseInt(userIdStr, 10) : undefined;

    const errorData: ErrorLogData = {
      errorMessage,
      stackTrace,
      source: 'frontend',
      userId,
      url: window.location.href,
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    };

    // Проверяем, есть ли похожая ошибка в очереди
    const isDuplicate = this.queue.some(item => item.errorMessage === errorMessage);
    if (!isDuplicate) {
      this.queue.push(errorData);
    }

    // Если очередь достигла максимального размера или это первая ошибка, начинаем обработку
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.processQueue();
    } else if (this.queue.length === 1) {
      // Для первой ошибки запускаем таймер на отложенную отправку
      if (this.throttleTimer === null) {
        this.throttleTimer = setTimeout(() => this.processQueue(), this.BATCH_TIMEOUT);
      }
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }

    this.isProcessing = true;

    const errors = [...this.queue];
    this.queue = [];

    try {
      // Отправляем логи ошибок на сервер
      await api.post('/logs', errors[0]);
    } catch (error) {
      console.error('Failed to send error logs:', error);

      // Возвращаем ошибки в очередь, если отправка не удалась
      this.queue = [...errors, ...this.queue];
    } finally {
      this.isProcessing = false;

      // Если в очереди остались ошибки, запускаем таймер на следующую обработку
      if (this.queue.length > 0) {
        this.throttleTimer = setTimeout(() => this.processQueue(), this.MIN_INTERVAL);
      }
    }
  }

  // Принудительная отправка всех ошибок из очереди
  public flushQueue(): void {
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

// Экспорт единственного экземпляра
export const errorLogger = ErrorLogger.getInstance();

// Хук для использования в функциональных компонентах
export function useErrorLogger(): {
  logError: (error: Error | string, metadata?: Record<string, any>) => void;
} {
  return {
    logError: (error: Error | string, metadata?: Record<string, any>) => {
      errorLogger.logError(error, metadata);
    },
  };
} 