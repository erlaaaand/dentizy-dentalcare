import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical_record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class MedicalRecordsService {
    constructor(
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
    ) { }

    async create(createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
        const { appointment_id } = createMedicalRecordDto;

        // 1. Cek apakah janji temu (appointment) ada
        const appointment = await this.appointmentRepository.findOneBy({ id: appointment_id });
        if (!appointment) {
            throw new NotFoundException(`Janji temu dengan ID #${appointment_id} tidak ditemukan`);
        }

        // 2. Cek apakah janji temu ini sudah punya rekam medis
        const existingRecord = await this.medicalRecordRepository.findOneBy({ appointment_id });
        if (existingRecord) {
            throw new ConflictException(`Janji temu dengan ID #${appointment_id} sudah memiliki rekam medis.`);
        }

        const newRecord = this.medicalRecordRepository.create(createMedicalRecordDto);
        return this.medicalRecordRepository.save(newRecord);
    }

    findAll(): Promise<MedicalRecord[]> {
        return this.medicalRecordRepository.find({ relations: ['appointment'] });
    }

    async findOne(id: number): Promise<MedicalRecord> {
        const record = await this.medicalRecordRepository.findOne({
            where: { id },
            relations: ['appointment', 'appointment.patient'], // Contoh relasi bertingkat
        });

        if (!record) {
            throw new NotFoundException(`Rekam medis dengan ID #${id} tidak ditemukan`);
        }
        return record;
    }

    // Method untuk mencari rekam medis berdasarkan ID janji temu
    async findByAppointmentId(appointmentId: number): Promise<MedicalRecord> {
        const record = await this.medicalRecordRepository.findOneBy({ appointment_id: appointmentId });
        if (!record) {
            throw new NotFoundException(`Tidak ada rekam medis untuk janji temu ID #${appointmentId}`);
        }
        return record;
    }

    async update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
        const record = await this.findOne(id);
        Object.assign(record, updateMedicalRecordDto);
        return this.medicalRecordRepository.save(record);
    }

    async remove(id: number): Promise<void> {
        const record = await this.findOne(id);
        await this.medicalRecordRepository.remove(record);
    }
}