// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sebaiknya nonaktifkan Swagger di production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('API Docs')
      .setDescription('Daftar API di aplikasi ini')
      .setVersion('1.0')
      .addBearerAuth() // Tambahkan ini jika pakai autentikasi JWT
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  app.enableCors();

  // Gunakan environment variable untuk port agar lebih fleksibel
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`🚀 Aplikasi berjalan di: ${await app.getUrl()}`);
}
bootstrap();