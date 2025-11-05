import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SeederService } from './seeder/seeder.service';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ✅ 1. SECURITY HEADERS dengan Helmet
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));

  // ✅ 2. CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ✅ 3. GLOBAL VALIDATION PIPE
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove properties yang tidak ada di DTO
    forbidNonWhitelisted: true, // Throw error jika ada property tidak dikenal
    transform: true, // Auto transform ke tipe yang sesuai
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // ✅ 4. SWAGGER (hanya untuk development)
  if (process.env.NODE_ENV !== 'production') {
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
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    logger.log('📚 Swagger available at: /api-docs');
  }

  // ✅ 5. DATABASE SEEDING (hanya di development)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const seeder = app.get(SeederService);
      await seeder.seed();
      logger.log('✅ Database seeding completed');
    } catch (error) {
      logger.error('❌ Seeding failed:', error);
    }
  }

  // ✅ 6. START SERVER
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Application running on: ${await app.getUrl()}`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV !== 'production') {
    logger.log(`📖 API Docs: ${await app.getUrl()}/api-docs`);
  }
}

bootstrap().catch((err) => {
  console.error('❌ Application failed to start:', err);
  process.exit(1);
});