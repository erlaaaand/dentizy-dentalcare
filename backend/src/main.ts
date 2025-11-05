import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SeederService } from './seeder/seeder.service';
import { ConfigService } from '@nestjs/config';
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
    }));

    // ✅ 2. CORS Configuration (Dynamic based on environment)
    const allowedOrigins = nodeEnv === 'production' 
      ? [frontendUrl] // Production: strict origin
      : [frontendUrl, 'http://localhost:3001', 'http://localhost:3000']; // Development: allow multiple

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin && nodeEnv !== 'production') {
            return callback(null, true);
        }

        if (!origin) {
            return callback(new Error('Origin header required'));
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);

        } else {
            logger.warn(`⚠️ CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      maxAge: 3600, // Cache preflight request for 1 hour
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
        },
      });
      
      logger.log('📚 Swagger available at: /api-docs');
    }

    // ✅ 5. DATABASE CONNECTION TEST
    try {
      const dataSource = app.get('DataSource');
      await dataSource.query('SELECT 1');
      logger.log('✅ Database connection successful');
    } catch (error) {
      logger.error('❌ Database connection failed:', error.message);
      throw new Error('Cannot connect to database. Please check your configuration.');
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
    process.on('SIGTERM', async () => {
      logger.warn('⚠️ SIGTERM signal received: closing HTTP server');
      await app.close();
      logger.log('✅ Application closed gracefully');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.warn('⚠️ SIGINT signal received: closing HTTP server');
      await app.close();
      logger.log('✅ Application closed gracefully');
      process.exit(0);
    });

    // ✅ 8. START SERVER
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
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

    if (nodeEnv === 'production') {
      logger.warn('⚠️ Running in PRODUCTION mode');
      logger.warn('⚠️ Make sure all environment variables are properly set');
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