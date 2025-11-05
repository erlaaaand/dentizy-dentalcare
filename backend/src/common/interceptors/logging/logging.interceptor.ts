import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    // Daftar field sensitif yang harus di-mask
    private readonly sensitiveFields = [
        'password',
        'token',
        'access_token',
        'refresh_token',
        'authorization',
        'cookie',
        'secret',
    ];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || 'Unknown';
        const startTime = Date.now();

        // Extract user info dari request (jika sudah login)
        const user = (request as any).user;
        const userId = user?.id || 'Anonymous';
        const username = user?.username || 'Guest';

        // Log incoming request
        this.logger.log(
            `[${method}] ${url} | User: ${username} (ID: ${userId}) | IP: ${ip}`
        );

        // Log request body (dengan masking)
        if (request.body && Object.keys(request.body).length > 0) {
            const sanitizedBody = this.maskSensitiveData(request.body);
            this.logger.debug(
                `Request Body: ${JSON.stringify(sanitizedBody, null, 2)}`
            );
        }

        return next.handle().pipe(
            tap((data) => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;

                // Log successful response
                this.logger.log(
                    `[${method}] ${url} | Status: ${statusCode} | ${duration}ms | User: ${username}`
                );

                // Log response data (hanya di development mode)
                if (process.env.NODE_ENV === 'development' && data) {
                    const sanitizedData = this.maskSensitiveData(data);
                    this.logger.debug(
                        `Response Data: ${JSON.stringify(sanitizedData, null, 2).substring(0, 500)}...`
                    );
                }

                // Warning untuk response yang lambat (> 1000ms)
                if (duration > 1000) {
                    this.logger.warn(
                        `Slow Response Alert: [${method}] ${url} took ${duration}ms`
                    );
                }
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;
                const statusCode = error.status || 500;

                // Log error dengan detail lengkap
                this.logger.error(
                    `[${method}] ${url} | Status: ${statusCode} | ${duration}ms | User: ${username} | Error: ${error.message}`
                );

                // Log error stack (hanya di development)
                if (process.env.NODE_ENV === 'development') {
                    this.logger.error(`Stack Trace: ${error.stack}`);
                }

                // Log error context untuk audit trail
                this.logger.error(
                    `Error Context: { userId: ${userId}, ip: ${ip}, userAgent: ${userAgent} }`
                );

                return throwError(() => error);
            })
        );
    }

    /**
     * Mask sensitive data dari object
     */
    private maskSensitiveData(data: any): any {
        if (!data || typeof data !== 'object') {
            return data;
        }

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map((item) => this.maskSensitiveData(item));
        }

        // Handle objects
        const masked = { ...data };
        
        for (const key in masked) {
            const lowerKey = key.toLowerCase();
            
            // Mask sensitive fields
            if (this.sensitiveFields.some(field => lowerKey.includes(field))) {
                masked[key] = '***MASKED***';
            } 
            // Recursively mask nested objects
            else if (typeof masked[key] === 'object' && masked[key] !== null) {
                masked[key] = this.maskSensitiveData(masked[key]);
            }
        }

        return masked;
    }
}