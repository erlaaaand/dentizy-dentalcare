import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical_records/medical_records.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SeederModule } from './seeder/seeder.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // ✅ Config Module dengan validasi
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // ✅ Throttling untuk rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 detik
      limit: 100, // 100 request per menit per IP
    }]),

    // ✅ Caching global
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 menit default
      max: 100, // Max 100 items
    }),

    // ✅ Database dengan connection pooling
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'dentizy_db'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production', // ⚠️ PENTING
        logging: configService.get('NODE_ENV') === 'development',
        // ✅ Connection pooling untuk performa
        extra: {
          connectionLimit: 10,
          connectTimeout: 60000,
        },
      }),
    }),

    // ✅ Mailer dengan retry mechanism
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: configService.get<string>('EMAIL_SECURE') === 'true',
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"Klinik Dentizy" <${configService.get<string>('EMAIL_USER')}>`,
        },
      }),
    }),

    // Modules
    UsersModule,
    RolesModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    NotificationsModule,
    ScheduleModule.forRoot(),
    SeederModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ✅ Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }