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

  private constructor() { }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public logError(error: Error | string, metadata?: Record<string, any>): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    // Просто логируем ошибку в консоль
    console.error('Error:', errorMessage);
    if (stackTrace) {
      console.error('Stack trace:', stackTrace);
    }
    if (metadata) {
      console.error('Metadata:', metadata);
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