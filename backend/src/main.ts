import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './seeder/seeder.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ambil instance SeederService dan jalankan method seed()
  const seeder = app.get(SeederService);
  await seeder.seed();

  app.enableCors();

  await app.listen(3000);
  Logger.log(`Aplikasi berjalan di: ${await app.getUrl()}`);
}
bootstrap();