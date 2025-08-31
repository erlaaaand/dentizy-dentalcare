// backend/src/app.module.ts
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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql', // atau 'mysql'
      host: 'localhost',
      port: 3306, // atau 3306 untuk mysql
      username: 'root', // username db Anda
      password: '',
      database: 'dentizy_db',
      autoLoadEntities: true,
      synchronize: true, // PENTING: Hanya untuk development
    }),
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
  providers: [AppService],
})
export class AppModule { }