import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Health Check Controller
 * Endpoint untuk monitoring status aplikasi dan dependencies
 */
@Controller('health')
export class HealthController {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    /**
     * Basic health check - cek apakah aplikasi running
     * GET /health
     */
    @Get()
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        };
    }

    /**
     * Detailed health check - cek status database
     * GET /health/details
     */
    @Get('details')
    async checkDetails() {
        const startTime = Date.now();

        // Check database connection
        let dbStatus = 'down';
        let dbMessage = 'Database connection failed';
        let dbResponseTime = 0;

        try {
            const dbStartTime = Date.now();
            await this.dataSource.query('SELECT 1');
            dbResponseTime = Date.now() - dbStartTime;
            dbStatus = 'up';
            dbMessage = 'Database connection successful';
        } catch (error) {
            dbMessage = `Database error: ${error.message}`;
        }

        const totalResponseTime = Date.now() - startTime;

        return {
            status: dbStatus === 'up' ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                api: {
                    status: 'up',
                    responseTime: `${totalResponseTime}ms`,
                },
                database: {
                    status: dbStatus,
                    message: dbMessage,
                    responseTime: `${dbResponseTime}ms`,
                },
            },
            system: {
                uptime: `${Math.floor(process.uptime())}s`,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                memory: {
                    used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                    total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
                },
            },
        };
    }

    /**
     * Liveness probe - untuk Kubernetes/Docker health check
     * GET /health/live
     */
    @Get('live')
    liveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Readiness probe - cek apakah app siap menerima traffic
     * GET /health/ready
     */
    @Get('ready')
    async readiness() {
        try {
            // Cek koneksi database
            await this.dataSource.query('SELECT 1');
            
            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'not_ready',
                reason: 'Database connection failed',
                timestamp: new Date().toISOString(),
            };
        }
    }
}