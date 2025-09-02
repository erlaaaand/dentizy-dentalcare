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

    findByAppointmentId(appointmentId: number) {
        throw new Error('Method not implemented.');
    }
    
    async create(createMedicalRecordDto: CreateMedicalRecordDto, user: User): Promise<MedicalRecord> {
        const { appointment_id } = createMedicalRecordDto;

        const appointment = await this.appointmentRepository.findOneBy({ id: appointment_id });
        if (!appointment) {
            throw new NotFoundException(`Janji temu dengan ID #${appointment_id} tidak ditemukan`);
        }

        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
        const isStaf = user.roles.some((role) => role.name === UserRole.STAF);

        // Otorisasi: Jika user adalah dokter, ia harus dokter yang menangani janji temu ini.
        if (isDoctor && appointment.doctor_id !== user.id) {
            throw new ForbiddenException('Anda tidak berhak mengisi rekam medis untuk janji temu ini.');
        }
        // Jika user adalah staf, ia diizinkan.

        // Validasi Logika Bisnis: Janji temu harus sudah selesai.
        if (appointment.status !== AppointmentStatus.SELESAI) {
            throw new ConflictException(`Rekam medis hanya bisa dibuat untuk janji temu yang sudah 'selesai'.`);
        }

        const existingRecord = await this.medicalRecordRepository.findOneBy({ appointment_id });
        if (existingRecord) {
            throw new ConflictException(`Janji temu ini sudah memiliki rekam medis.`);
        }

        const newRecord = this.medicalRecordRepository.create({
            ...createMedicalRecordDto,
            user_id_staff: user.id, // Catat siapa yang membuat/mengisi
        });
        return this.medicalRecordRepository.save(newRecord);
    }

    async findAll(user: User /*, queryDto: FindRecordsDto */): Promise<MedicalRecord[]> {
        const queryBuilder = this.medicalRecordRepository
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.appointment', 'appointment')
            .leftJoinAndSelect('appointment.patient', 'patient');

        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);

        // Otorisasi: Dokter hanya bisa melihat rekam medis dari janji temu yang ia tangani.
        if (isDoctor) {
            queryBuilder.where('appointment.doctor_id = :doctorId', { doctorId: user.id });
        }

        // Nanti bisa ditambahkan filter berdasarkan queryDto

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

        if (isDoctor) {
            queryBuilder.andWhere('appointment.doctor_id = :doctorId', { doctorId: user.id });
        }

        const record = await queryBuilder.getOne();

        if (!record) {
            throw new NotFoundException(`Rekam medis dengan ID #${id} tidak ditemukan atau Anda tidak memiliki akses.`);
        }
        return record;
    }

    async update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto, user: User): Promise<MedicalRecord> {
        // Dengan memanggil findOne, kita sudah otomatis melakukan pengecekan hak akses
        const record = await this.findOne(id, user);
        Object.assign(record, updateMedicalRecordDto);
        return this.medicalRecordRepository.save(record);
    }

    async remove(id: number, user: User): Promise<void> {
        const record = await this.findOne(id, user);
        await this.medicalRecordRepository.remove(record);
    }
}