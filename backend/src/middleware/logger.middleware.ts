import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `Incoming Request - ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`
    );

    // Log request body if exists
    if (Object.keys(req.body || {}).length > 0) {
      const sanitizedBody = this.sanitizeBody(req.body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Log query params if exists
    if (Object.keys(req.query || {}).length > 0) {
      this.logger.debug(`Query Params: ${JSON.stringify(req.query)}`);
    }

    // Capture response
    const originalSend = res.send;
    res.send = function (body: any): Response {
      const responseTime = Date.now() - startTime;
      const contentLength = body ? body.length : 0;

      // Log response
      this.logger.log(
        `Outgoing Response - ${method} ${originalUrl} - Status: ${res.statusCode} - ${responseTime}ms - Size: ${contentLength} bytes`
      );

      return originalSend.call(this, body);
    }.bind(this);

    next();
  }

  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***REDACTED***';
      }
    });

    return sanitized;
  }
} 