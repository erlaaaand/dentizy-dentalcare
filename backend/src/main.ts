import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SeederService } from './seeder/seeder.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // ✅ Get ConfigService
    const configService = app.get(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const port = configService.get<number>('PORT', 3000);
    const frontendUrl = configService.get<string>('FRONTEND_URL');

    // ✅ SECURITY: Validate critical environment variables
    if (!configService.get('JWT_SECRET')) {
      throw new Error('JWT_SECRET is not defined in environment variables!');
    }

    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not defined in environment variables!');
    }

    // ✅ 1. SECURITY HEADERS dengan Helmet
    app.use(helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: nodeEnv === 'production',
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }));

    // ✅ 2. IMPROVED CORS Configuration
    const allowedOrigins = nodeEnv === 'production' 
      ? [frontendUrl] // Production: strict origin
      : [frontendUrl, 'http://localhost:3001', 'http://localhost:3000']; // Development

    app.enableCors({
      origin: (origin, callback) => {
        // ✅ FIX: Stricter origin checking
        
        // In production, ALWAYS require origin header
        if (!origin) {
          if (nodeEnv === 'production') {
            logger.error(`🚫 CORS blocked: Missing origin header (Production mode)`);
            return callback(new Error('Origin header required in production'));
          }
          
          // Development: Allow no-origin (e.g., Postman, curl)
          logger.debug(`⚠️ No origin header - allowing (Development mode only)`);
          return callback(null, true);
        }
        
        // Check if origin is in whitelist
        if (allowedOrigins.includes(origin)) {
          logger.debug(`✅ CORS allowed: ${origin}`);
          callback(null, true);
        } else {
          // ✅ FIX: Log with proper error level and detailed info
          logger.error(`🚫 CORS blocked: ${origin} not in whitelist`);
          logger.error(`Allowed origins: ${allowedOrigins.join(', ')}`);
          callback(new Error(`Origin ${origin} not allowed by CORS policy`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
      maxAge: 3600, // Cache preflight request for 1 hour
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // ✅ 3. GLOBAL VALIDATION PIPE
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Remove properties yang tidak ada di DTO
      forbidNonWhitelisted: true, // Throw error jika ada property tidak dikenal
      transform: true, // Auto transform ke tipe yang sesuai
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: nodeEnv === 'production', // Hide detailed errors in production
      validationError: {
        target: false, // Don't expose target object
        value: false,  // Don't expose submitted values in production
      },
    }));

    // ✅ 4. SWAGGER (hanya untuk development)
    if (nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Dentizy API')
        .setDescription('API Documentation untuk Sistem Manajemen Klinik Gigi')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          'access-token',
        )
        .addTag('Authentication', 'Endpoints untuk login dan autentikasi')
        .addTag('Users', 'Manajemen user (dokter, staf, kepala klinik)')
        .addTag('Patients', 'Manajemen data pasien')
        .addTag('Appointments', 'Manajemen janji temu')
        .addTag('Medical Records', 'Manajemen rekam medis')
        .addTag('Notifications', 'Sistem notifikasi dan reminder')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
        },
      });
      
      logger.log('📚 Swagger available at: /api-docs');
    }

    // ✅ 5. DATABASE CONNECTION TEST
    try {
      const dataSource = app.get(DataSource);
      await dataSource.query('SELECT 1');
      logger.log('✅ Database connection successful');
    } catch (error) {
      logger.error('❌ Database connection failed:', error.message);
      
      if (nodeEnv === 'production') {
        throw new Error('Cannot connect to database. Please check your configuration.');
      } else {
        logger.warn('⚠️ Continuing without database in development mode');
      }
    }

    // ✅ 6. DATABASE SEEDING (hanya di development)
    if (nodeEnv !== 'production') {
      try {
        const seeder = app.get(SeederService);
        await seeder.seed();
        logger.log('✅ Database seeding completed');
      } catch (error) {
        logger.error('❌ Seeding failed:', error.message);
        // Don't throw error, seeding is optional
      }
    }

    // ✅ 7. GRACEFUL SHUTDOWN HANDLERS
    const gracefulShutdown = async (signal: string) => {
      logger.warn(`⚠️ ${signal} signal received: closing HTTP server`);
      
      try {
        await app.close();
        logger.log('✅ Application closed gracefully');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // ✅ 8. UNHANDLED REJECTION HANDLER
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      
      if (nodeEnv === 'production') {
        // In production, restart the application
        gracefulShutdown('UNHANDLED_REJECTION');
      }
    });

    // ✅ 9. START SERVER
    await app.listen(port);

    logger.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Dentizy API Server Started Successfully         ║
║                                                       ║
║   🌍 Environment:  ${nodeEnv.padEnd(35)}║
║   🔌 Port:         ${port.toString().padEnd(35)}║
║   📡 URL:          http://localhost:${port}${' '.repeat(22)}║
${nodeEnv !== 'production' ? `║   📖 API Docs:     http://localhost:${port}/api-docs${' '.repeat(14)}║` : ''}
║   🔐 CORS Origin:  ${frontendUrl.padEnd(35)}║
║   🏥 Health:       http://localhost:${port}/health${' '.repeat(19)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    if (nodeEnv === 'production') {
      logger.warn('⚠️ Running in PRODUCTION mode');
      logger.warn('⚠️ Make sure all environment variables are properly set');
      logger.warn('⚠️ CORS is strictly enforced');
    } else {
      logger.log('🛠️ Running in DEVELOPMENT mode');
      logger.log('🔓 CORS is relaxed for local development');
    }

  } catch (error) {
    logger.error('❌ Application failed to start:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap error:', err);
  process.exit(1);
});