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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}