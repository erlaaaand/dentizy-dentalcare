import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MedicalRecord } from './entities/medical_record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical_record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical_record.dto';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../roles/entities/role.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class MedicalRecordsService {
    constructor(
        @InjectRepository(MedicalRecord)
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
        private readonly dataSource: DataSource,
        private readonly logger = new Logger(MedicalRecordsService.name)
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
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .leftJoinAndSelect('doctor.roles', 'doctorRoles');

        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
        const isKepalaKlinik = user.roles.some((role) => role.name === UserRole.KEPALA_KLINIK);
        const isStaf = user.roles.some((role) => role.name === UserRole.STAF);

        // Authorization filtering
        if (!isKepalaKlinik) {
            if (isDoctor) {
                // Dokter hanya bisa melihat rekam medis dari janji temu yang ia tangani
                // atau yang ia buat sendiri
                queryBuilder.andWhere(
                    '(appointment.doctor_id = :doctorId OR record.user_id_staff = :doctorId)',
                    { doctorId: user.id }
                );
            } else if (isStaf) {
                // Staf bisa melihat semua rekam medis yang tidak dibatalkan
                queryBuilder.andWhere(
                    'appointment.status != :cancelled',
                    { cancelled: AppointmentStatus.DIBATALKAN }
                );
            }
        }

        // Add ordering
        queryBuilder.orderBy('record.created_at', 'DESC');

        const records = await queryBuilder.getMany();

        // ✅ AUDIT: Log access
        this.logger.log(
            `User ${user.id} (${user.roles.map(r => r.name).join(', ')}) ` +
            `accessed ${records.length} medical record(s)`
        );

        return records;
    }

    async findOne(id: number, user: User): Promise<MedicalRecord> {
        const queryBuilder = this.medicalRecordRepository
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.appointment', 'appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.doctor', 'doctor')
            .leftJoinAndSelect('doctor.roles', 'doctorRoles')
            .where('record.id = :id', { id });

        const isDoctor = user.roles.some((role) => role.name === UserRole.DOKTER);
        const isKepalaKlinik = user.roles.some((role) => role.name === UserRole.KEPALA_KLINIK);
        const isStaf = user.roles.some((role) => role.name === UserRole.STAF);

        // ✅ FIX: More granular access control
        if (!isKepalaKlinik) {
            if (isDoctor) {
                // Doctor can see records they created OR from their appointments
                queryBuilder.andWhere(
                    '(appointment.doctor_id = :userId OR record.user_id_staff = :userId)',
                    { userId: user.id }
                );
            } else if (isStaf) {
                // Staff can see records they created OR any active records (for administrative purposes)
                queryBuilder.andWhere(
                    '(record.user_id_staff = :userId OR appointment.status != :cancelled)',
                    { userId: user.id, cancelled: AppointmentStatus.DIBATALKAN }
                );
            } else {
                // Unknown role - deny access
                throw new ForbiddenException('Anda tidak memiliki akses ke rekam medis');
            }
        }

        const record = await queryBuilder.getOne();

        if (!record) {
            throw new NotFoundException(
                `Rekam medis dengan ID #${id} tidak ditemukan atau Anda tidak memiliki akses.`
            );
        }

        return record;
    }

    async update(id: number, updateMedicalRecordDto: UpdateMedicalRecordDto, user: User): Promise<MedicalRecord> {
        return await this.dataSource.transaction(async manager => {
            // Fetch record with proper relations
            const record = await manager.findOne(MedicalRecord, {
                where: { id },
                relations: ['appointment', 'appointment.doctor', 'appointment.doctor.roles'],
            });

            if (!record) {
                throw new NotFoundException(`Rekam medis dengan ID #${id} tidak ditemukan`);
            }

            // ✅ FIX: Comprehensive authorization check
            const isKepalaKlinik = user.roles.some(r => r.name === UserRole.KEPALA_KLINIK);
            const isStaf = user.roles.some(r => r.name === UserRole.STAF);
            const isDokter = user.roles.some(r => r.name === UserRole.DOKTER);

            if (!isKepalaKlinik) {
                const isCreator = record.user_id_staff === user.id;
                const isAppointmentDoctor = record.appointment.doctor_id === user.id;

                if (isDokter) {
                    // Doctor must be either creator or appointment doctor
                    if (!isCreator && !isAppointmentDoctor) {
                        throw new ForbiddenException(
                            'Anda hanya bisa mengubah rekam medis yang Anda buat atau dari pasien Anda'
                        );
                    }
                } else if (isStaf) {
                    // Staff must be creator
                    if (!isCreator) {
                        throw new ForbiddenException(
                            'Anda hanya bisa mengubah rekam medis yang Anda buat'
                        );
                    }
                } else {
                    // Unknown role
                    throw new ForbiddenException('Anda tidak memiliki akses untuk mengubah rekam medis');
                }
            }

            // ✅ VALIDATION: Check if appointment is still valid for updates
            const appointment = record.appointment;

            if (appointment.status === AppointmentStatus.DIBATALKAN) {
                throw new ConflictException('Tidak dapat mengubah rekam medis dari janji temu yang dibatalkan');
            }

            // ✅ AUDIT: Log who is updating what
            this.logger.log(
                `User ${user.id} (${user.roles.map(r => r.name).join(', ')}) ` +
                `updating medical record #${id} (created by user ${record.user_id_staff})`
            );

            // Update record
            Object.assign(record, updateMedicalRecordDto);
            const updatedRecord = await manager.save(record);

            // Ensure appointment status is SELESAI if it has medical record
            if (appointment.status !== AppointmentStatus.SELESAI) {
                appointment.status = AppointmentStatus.SELESAI;
                await manager.save(appointment);

                this.logger.log(`Appointment #${appointment.id} status updated to SELESAI`);
            }

            return updatedRecord;
        });
    }

    async remove(id: number, user: User): Promise<void> {
        const record = await this.findOne(id, user);
        await this.medicalRecordRepository.remove(record);
    }
}