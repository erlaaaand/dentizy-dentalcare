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
import { v4 as uuidv4 } from 'uuid';

/**
 * ✅ ENHANCED: Logging interceptor with request ID tracing
 */
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

        // ✅ FIX: Generate unique request ID for tracing
        const requestId = headers['x-request-id'] as string || uuidv4();
        
        // ✅ Attach request ID to request object for use in other parts of app
        (request as any).requestId = requestId;
        
        // ✅ Set request ID in response header for client tracking
        response.setHeader('X-Request-ID', requestId);

        // Extract user info dari request (jika sudah login)
        const user = (request as any).user;
        const userId = user?.id || 'Anonymous';
        const username = user?.username || 'Guest';

        // ✅ Log incoming request dengan request ID
        this.logger.log(
            `[${requestId}] [${method}] ${url} | User: ${username} (ID: ${userId}) | IP: ${ip}`
        );

        // Log request body (dengan masking)
        if (request.body && Object.keys(request.body).length > 0) {
            const sanitizedBody = this.maskSensitiveData(request.body);
            this.logger.debug(
                `[${requestId}] Request Body: ${JSON.stringify(sanitizedBody, null, 2)}`
            );
        }

        return next.handle().pipe(
            tap((data) => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;

                // ✅ Log successful response dengan request ID
                this.logger.log(
                    `[${requestId}] [${method}] ${url} | Status: ${statusCode} | ${duration}ms | User: ${username}`
                );

                // Log response data (hanya di development mode)
                if (process.env.NODE_ENV === 'development' && data) {
                    const sanitizedData = this.maskSensitiveData(data);
                    const responsePreview = JSON.stringify(sanitizedData, null, 2).substring(0, 500);
                    this.logger.debug(
                        `[${requestId}] Response Data: ${responsePreview}${responsePreview.length >= 500 ? '...' : ''}`
                    );
                }

                // ✅ Warning untuk response yang lambat (> 1000ms)
                if (duration > 1000) {
                    this.logger.warn(
                        `[${requestId}] ⚠️ Slow Response: [${method}] ${url} took ${duration}ms`
                    );
                }

                // ✅ Track performance metrics per endpoint
                this.trackPerformanceMetrics(method, url, duration, statusCode);
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;
                const statusCode = error.status || 500;

                // ✅ Log error dengan detail lengkap dan request ID
                this.logger.error(
                    `[${requestId}] [${method}] ${url} | Status: ${statusCode} | ${duration}ms | User: ${username} | Error: ${error.message}`
                );

                // Log error stack (hanya di development)
                if (process.env.NODE_ENV === 'development') {
                    this.logger.error(`[${requestId}] Stack Trace: ${error.stack}`);
                }

                // ✅ Log error context untuk audit trail
                this.logger.error(
                    `[${requestId}] Error Context: { userId: ${userId}, ip: ${ip}, userAgent: ${userAgent} }`
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

    /**
     * ✅ NEW: Track performance metrics (can be extended to push to monitoring service)
     */
    private trackPerformanceMetrics(
        method: string,
        url: string,
        duration: number,
        statusCode: number
    ): void {
        // Simple in-memory tracking (can be replaced with Prometheus, DataDog, etc.)
        if (duration > 3000) {
            this.logger.error(
                `🔴 CRITICAL SLOW ENDPOINT: [${method}] ${url} took ${duration}ms (status: ${statusCode})`
            );
        } else if (duration > 1000) {
            this.logger.warn(
                `🟡 SLOW ENDPOINT: [${method}] ${url} took ${duration}ms (status: ${statusCode})`
            );
        }

        // Here you can add code to push metrics to external monitoring service
        // Example: prometheusClient.histogram('http_request_duration_ms', duration, { method, url, statusCode })
    }
}