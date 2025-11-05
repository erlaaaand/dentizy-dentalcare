import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
        private readonly dataSource: DataSource,
    ) { }

    async findByAppointmentId(appointmentId: number, user: User): Promise<MedicalRecord | null> {
        const record = await this.medicalRecordRepository.findOne({
            where: { appointment_id: appointmentId },
            relations: ['appointment', 'appointment.patient', 'appointment.doctor', 'appointment.doctor.roles'],
        });

        if (!record) {
            return null;
        }

        // ✅ FIX: Authorization check
        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
        const isKepalaKlinik = user.roles.some((role) => role.name === UserRole.KEPALA_KLINIK);

        if (isDoctor && !isKepalaKlinik && record.appointment.doctor_id !== user.id) {
            throw new ForbiddenException('Anda tidak memiliki akses ke rekam medis ini');
        }

        return record;
    }

    async create(createMedicalRecordDto: CreateMedicalRecordDto, user: User): Promise<MedicalRecord> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { appointment_id } = createMedicalRecordDto;

            const appointment = await queryRunner.manager.findOne(Appointment, {
                where: { id: appointment_id },
                relations: ['doctor', 'patient'],
            });

            if (!appointment) {
                throw new NotFoundException(`Janji temu dengan ID #${appointment_id} tidak ditemukan`);
            }

            const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
            const isKepalaKlinik = user.roles.some((role) => role.name === UserRole.KEPALA_KLINIK);

            if (isDoctor && !isKepalaKlinik && appointment.doctor_id !== user.id) {
                throw new ForbiddenException('Anda tidak berhak mengisi rekam medis untuk janji temu ini.');
            }

            if (appointment.status === AppointmentStatus.DIBATALKAN) {
                throw new ConflictException(`Rekam medis tidak bisa dibuat untuk janji temu yang dibatalkan.`);
            }

            // Cek apakah sudah ada rekam medis
            const existingRecord = await queryRunner.manager.findOneBy(MedicalRecord, { appointment_id });
            if (existingRecord) {
                throw new ConflictException(`Janji temu ini sudah memiliki rekam medis.`);
            }

            // Buat rekam medis baru
            const newRecord = queryRunner.manager.create(MedicalRecord, {
                ...createMedicalRecordDto,
                user_id_staff: user.id,
            });
            const savedRecord = await queryRunner.manager.save(newRecord);

            // Update appointment status
            if (appointment.status !== AppointmentStatus.SELESAI) {
                appointment.status = AppointmentStatus.SELESAI;
                await queryRunner.manager.save(appointment);
            }

            await queryRunner.commitTransaction();

            return savedRecord;

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }

            throw new BadRequestException('Gagal membuat rekam medis');
        } finally {
            await queryRunner.release();
        }
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