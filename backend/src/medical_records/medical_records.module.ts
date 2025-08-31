import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordsService } from './medical_records.service';
import { MedicalRecordsController } from './medical_records.controller';
import { MedicalRecord } from './entities/medical_record.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MedicalRecord, Appointment])],
    controllers: [MedicalRecordsController],
    providers: [MedicalRecordsService],
})
export class MedicalRecordsModule { }