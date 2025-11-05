import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical_record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../roles/entities/role.entity';

@Injectable()
export class MedicalRecordsService {
    constructor(
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
    ) { }

    async findByAppointmentId(appointmentId: number): Promise<MedicalRecord | null> {
        const record = await this.medicalRecordRepository.findOne({
            where: { appointment_id: appointmentId },
            relations: ['appointment', 'appointment.patient', 'appointment.doctor'],
        });
        return record;
    }

    async create(createMedicalRecordDto: CreateMedicalRecordDto, user: User): Promise<MedicalRecord> {
        const { appointment_id } = createMedicalRecordDto;

        // Ambil appointment dengan relasi
        const appointment = await this.appointmentRepository.findOne({
            where: { id: appointment_id },
            relations: ['doctor', 'patient'],
        });

        if (!appointment) {
            throw new NotFoundException(`Janji temu dengan ID #${appointment_id} tidak ditemukan`);
        }

        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
        const isKepalaKlinik = user.roles.some((role) => role.name === UserRole.KEPALA_KLINIK);
        const isStaf = user.roles.some((role) => role.name === UserRole.STAF);

        // Otorisasi: Dokter harus menangani janji temu ini, Kepala Klinik bisa akses semua
        if (isDoctor && appointment.doctor_id !== user.id) {
            throw new ForbiddenException('Anda tidak berhak mengisi rekam medis untuk janji temu ini.');
        }

        // Validasi: Appointment harus sudah dijadwalkan (belum selesai/dibatalkan)
        if (appointment.status === AppointmentStatus.DIBATALKAN) {
            throw new ConflictException(`Rekam medis tidak bisa dibuat untuk janji temu yang dibatalkan.`);
        }

        // Cek apakah sudah ada rekam medis
        const existingRecord = await this.medicalRecordRepository.findOneBy({ appointment_id });
        if (existingRecord) {
            throw new ConflictException(`Janji temu ini sudah memiliki rekam medis.`);
        }

        // Buat rekam medis baru
        const newRecord = this.medicalRecordRepository.create({
            ...createMedicalRecordDto,
            user_id_staff: user.id,
        });
        const savedRecord = await this.medicalRecordRepository.save(newRecord);

        // 🔥 FITUR BARU: Otomatis tandai appointment sebagai SELESAI
        if (appointment.status !== AppointmentStatus.SELESAI) {
            appointment.status = AppointmentStatus.SELESAI;
            await this.appointmentRepository.save(appointment);
        }

        return savedRecord;
    }

    async findAll(user: User): Promise<MedicalRecord[]> {
        const queryBuilder = this.medicalRecordRepository
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.appointment', 'appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.doctor', 'doctor');

        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
        const isKepalaKlinik = user.roles.some((role) => role.name === UserRole.KEPALA_KLINIK);

        // Dokter hanya bisa melihat rekam medis dari janji temu yang ia tangani
        // Kepala Klinik bisa melihat semua rekam medis
        if (isDoctor && !isKepalaKlinik) {
            queryBuilder.where('appointment.doctor_id = :doctorId', { doctorId: user.id });
        }

        return queryBuilder.getMany();
    }

    async findOne(id: number, user: User): Promise<MedicalRecord> {
        const queryBuilder = this.medicalRecordRepository
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.appointment', 'appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .where('record.id = :id', { id });

        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
        const isKepalaKlinik = user.roles.some((role) => role.name === UserRole.KEPALA_KLINIK);

        // Dokter hanya bisa melihat rekam medis dari janji temu yang ia tangani
        if (isDoctor && !isKepalaKlinik) {
            queryBuilder.andWhere('appointment.doctor_id = :doctorId', { doctorId: user.id });
        }

        const record = await queryBuilder.getOne();

        if (!record) {
            throw new NotFoundException(`Rekam medis dengan ID #${id} tidak ditemukan atau Anda tidak memiliki akses.`);
        }
        return record;
    }

    async update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto, user: User): Promise<MedicalRecord> {
        const record = await this.findOne(id, user);
        
        Object.assign(record, updateMedicalRecordDto);
        const updatedRecord = await this.medicalRecordRepository.save(record);

        // 🔥 FITUR BARU: Saat update rekam medis, pastikan appointment tetap selesai
        const appointment = await this.appointmentRepository.findOneBy({ id: record.appointment_id });
        if (appointment && appointment.status !== AppointmentStatus.SELESAI) {
            appointment.status = AppointmentStatus.SELESAI;
            await this.appointmentRepository.save(appointment);
        }

        return updatedRecord;
    }

    async remove(id: number, user: User): Promise<void> {
        const record = await this.findOne(id, user);
        await this.medicalRecordRepository.remove(record);
    }
}