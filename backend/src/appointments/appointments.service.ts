import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThan, MoreThan } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/roles/entities/role.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';

@Injectable()
export class AppointmentsService {
    private readonly logger = new Logger(AppointmentsService.name);

    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly notificationsService: NotificationsService,
        private readonly dataSource: DataSource,
    ) { }

    /**
     * Buat appointment baru
     */
    async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { patient_id, doctor_id, tanggal_janji, jam_janji } = createAppointmentDto;

            // 1. VALIDASI: Patient ada atau tidak
            const patient = await queryRunner.manager.findOneBy(Patient, { id: patient_id });
            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${patient_id} tidak ditemukan`);
            }

            // 2. VALIDASI: Doctor ada atau tidak
            const doctor = await queryRunner.manager.findOne(User, {
                where: { id: doctor_id },
                relations: ['roles'],
            });

            if (!doctor) {
                throw new NotFoundException(`Dokter dengan ID #${doctor_id} tidak ditemukan`);
            }

            // 3. VALIDASI: User adalah dokter atau kepala klinik
            const isDokter = doctor.roles.some(role => role.name === UserRole.DOKTER);
            const isKepalaKlinik = doctor.roles.some(role => role.name === UserRole.KEPALA_KLINIK);

            if (!isDokter && !isKepalaKlinik) {
                throw new ForbiddenException(`User dengan ID #${doctor_id} bukan dokter atau kepala klinik`);
            }

            // 4. VALIDASI: Tanggal tidak boleh di masa lalu
            const appointmentDate = new Date(tanggal_janji);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (appointmentDate < today) {
                throw new BadRequestException('Tanggal janji temu tidak boleh di masa lalu');
            }

            // ✅ FIX: Validasi jam kerja (08:00 - 17:00)
            const [hours, minutes] = jam_janji.split(':').map(Number);
            if (hours < 8 || hours >= 17) {
                throw new BadRequestException('Jam janji harus antara 08:00 - 17:00');
            }

            // ✅ FIX: Cek bentrok jadwal dengan buffer time (30 menit)
            const appointmentTime = new Date(appointmentDate);
            appointmentTime.setHours(hours, minutes, 0, 0);

            const bufferStart = new Date(appointmentTime);
            bufferStart.setMinutes(bufferStart.getMinutes() - 30);

            const bufferEnd = new Date(appointmentTime);
            bufferEnd.setMinutes(bufferEnd.getMinutes() + 30);

            const conflictingAppointment = await queryRunner.manager
                .createQueryBuilder(Appointment, 'appointment')
                .where('appointment.doctor_id = :doctor_id', { doctor_id })
                .andWhere('appointment.tanggal_janji = :tanggal_janji', { tanggal_janji: appointmentDate })
                .andWhere('appointment.status = :status', { status: AppointmentStatus.DIJADWALKAN })
                .andWhere(`TIME(CONCAT(appointment.tanggal_janji, ' ', appointment.jam_janji)) BETWEEN :bufferStart AND :bufferEnd`, {
                    bufferStart: jam_janji,
                    bufferEnd: jam_janji,
                })
                .getOne();

            if (conflictingAppointment) {
                throw new ConflictException(
                    `Dokter sudah memiliki janji temu di waktu yang berdekatan. Silakan pilih jam lain.`
                );
            }

            // 6. BUAT APPOINTMENT BARU
            const newAppointment = queryRunner.manager.create(Appointment, {
                ...createAppointmentDto,
                tanggal_janji: appointmentDate,
                patient,
                doctor,
            });

            const savedAppointment = await queryRunner.manager.save(newAppointment);

            await queryRunner.commitTransaction();

            // 7. JADWALKAN REMINDER (di luar transaction)
            if (savedAppointment.patient.email && savedAppointment.patient.is_registered_online) {
                try {
                    await this.notificationsService.scheduleAppointmentReminder(savedAppointment);
                    this.logger.log(`📧 Reminder scheduled for appointment #${savedAppointment.id}`);
                } catch (error) {
                    this.logger.error('❌ Failed to schedule reminder:', error);
                }
            }

            this.logger.log(`✅ Appointment created: #${savedAppointment.id}`);

            return savedAppointment;

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            this.logger.error('❌ Error creating appointment:', error);
            throw new BadRequestException('Gagal membuat janji temu');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Ambil daftar appointments dengan filter
     */
    async findAll(user: User, queryDto: FindAppointmentsQueryDto) {
        const { doctorId, date, status, page = 1, limit = 10 } = queryDto;
        const skip = (page - 1) * limit;

        try {
            //  BUILD QUERY dengan QueryBuilder untuk performa lebih baik
            const queryBuilder = this.appointmentRepository
                .createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.doctor', 'doctor')
                .leftJoinAndSelect('doctor.roles', 'doctorRoles');

            //  FILTER BY DATE
            if (date) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);

                queryBuilder.andWhere(
                    'appointment.tanggal_janji BETWEEN :startDate AND :endDate',
                    { startDate, endDate }
                );
            }

            //  AUTHORIZATION: Dokter hanya bisa lihat appointmentnya sendiri
            const isDoctor = user.roles.some(role => role.name === UserRole.DOKTER);
            const isKepalaKlinik = user.roles.some(role => role.name === UserRole.KEPALA_KLINIK);

            if (isDoctor && !isKepalaKlinik) {
                queryBuilder.andWhere('appointment.doctor_id = :userId', { userId: user.id });
            } else if (doctorId) {
                // Kepala Klinik atau Staf bisa filter by doctor
                queryBuilder.andWhere('appointment.doctor_id = :doctorId', { doctorId });
            }

            //  FILTER BY STATUS
            if (status) {
                queryBuilder.andWhere('appointment.status = :status', { status });
            }

            //  ORDER & PAGINATION
            queryBuilder
                .orderBy('appointment.tanggal_janji', 'DESC')
                .addOrderBy('appointment.jam_janji', 'ASC')
                .take(limit)
                .skip(skip);

            const [appointments, total] = await queryBuilder.getManyAndCount();

            this.logger.log(`📋 Retrieved ${appointments.length}/${total} appointments`);

            return {
                data: appointments,
                count: total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };

        } catch (error) {
            this.logger.error('Error fetching appointments:', error);
            throw new BadRequestException('Gagal mengambil daftar janji temu');
        }
    }

    /**
     * Ambil appointment by ID
     */
    async findOne(id: number, user: User): Promise<Appointment> {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: ['patient', 'doctor', 'doctor.roles', 'medical_record'],
            });

            if (!appointment) {
                throw new NotFoundException(`Janji temu dengan ID #${id} tidak ditemukan`);
            }

            //  AUTHORIZATION: Dokter hanya bisa lihat appointmentnya sendiri
            const isDoctor = user.roles.some(role => role.name === UserRole.DOKTER);
            const isKepalaKlinik = user.roles.some(role => role.name === UserRole.KEPALA_KLINIK);

            if (isDoctor && !isKepalaKlinik && appointment.doctor_id !== user.id) {
                throw new ForbiddenException('Anda tidak memiliki akses ke janji temu ini');
            }

            return appointment;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }

            this.logger.error(`Error finding appointment ID ${id}:`, error);
            throw new BadRequestException('Gagal mengambil data janji temu');
        }
    }

    /**
     * Selesaikan appointment
     */
    async complete(id: number, user: User): Promise<Appointment> {
        try {
            const appointment = await this.findOne(id, user);

            //  VALIDASI: Status harus DIJADWALKAN
            if (appointment.status !== AppointmentStatus.DIJADWALKAN) {
                throw new ConflictException(
                    `Hanya janji temu yang berstatus 'dijadwalkan' yang bisa diselesaikan. Status saat ini: ${appointment.status}`
                );
            }

            // AUTHORIZATION: Hanya dokter yang menangani yang bisa complete
            const isKepalaKlinik = user.roles.some(role => role.name === UserRole.KEPALA_KLINIK);

            if (!isKepalaKlinik && appointment.doctor_id !== user.id) {
                throw new ForbiddenException('Hanya dokter yang menangani yang bisa menyelesaikan janji temu ini');
            }

            appointment.status = AppointmentStatus.SELESAI;
            const updated = await this.appointmentRepository.save(appointment);

            this.logger.log(`Appointment #${id} completed by user #${user.id}`);

            return updated;

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }

            this.logger.error(`Error completing appointment ID ${id}:`, error);
            throw new BadRequestException('Gagal menyelesaikan janji temu');
        }
    }

    /**
     * Batalkan appointment
     */
    async cancel(id: number, user: User): Promise<Appointment> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const appointment = await queryRunner.manager.findOne(Appointment, {
                where: { id },
                relations: ['patient', 'doctor', 'doctor.roles'],
            });

            if (!appointment) {
                throw new NotFoundException(`Janji temu dengan ID #${id} tidak ditemukan`);
            }

            // AUTHORIZATION
            const isDoctor = user.roles.some(role => role.name === UserRole.DOKTER);
            const isKepalaKlinik = user.roles.some(role => role.name === UserRole.KEPALA_KLINIK);

            if (isDoctor && !isKepalaKlinik && appointment.doctor_id !== user.id) {
                throw new ForbiddenException('Anda tidak memiliki akses ke janji temu ini');
            }

            // VALIDASI: Appointment yang sudah selesai tidak bisa dibatalkan
            if (appointment.status === AppointmentStatus.SELESAI) {
                throw new ConflictException('Janji temu yang sudah selesai tidak bisa dibatalkan');
            }

            if (appointment.status === AppointmentStatus.DIBATALKAN) {
                throw new ConflictException('Janji temu ini sudah dibatalkan sebelumnya');
            }

            // ✅ FIX: Validasi pembatalan < 24 jam memerlukan approval (contoh rule bisnis)
            const appointmentDateTime = new Date(appointment.tanggal_janji);
            const [hours, minutes] = appointment.jam_janji.split(':').map(Number);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            const now = new Date();
            const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursDifference < 24 && !isKepalaKlinik) {
                throw new ForbiddenException(
                    'Pembatalan janji temu kurang dari 24 jam hanya bisa dilakukan oleh Kepala Klinik'
                );
            }

            appointment.status = AppointmentStatus.DIBATALKAN;

            // BATALKAN REMINDER
            try {
                await this.notificationsService.cancelRemindersFor(appointment.id);
                this.logger.log(`📧 Reminders cancelled for appointment #${appointment.id}`);
            } catch (error) {
                this.logger.error('❌ Failed to cancel reminders:', error);
            }

            const updated = await queryRunner.manager.save(appointment);

            await queryRunner.commitTransaction();

            this.logger.log(`❌ Appointment #${id} cancelled by user #${user.id}`);

            return updated;

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }

            this.logger.error(`❌ Error cancelling appointment ID ${id}:`, error);
            throw new BadRequestException('Gagal membatalkan janji temu');
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Update appointment
     */
    async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: ['patient', 'doctor'],
            });

            if (!appointment) {
                throw new NotFoundException(`Janji temu dengan ID #${id} tidak ditemukan`);
            }

            // VALIDASI: Jangan update appointment yang sudah selesai atau dibatalkan
            if (appointment.status === AppointmentStatus.SELESAI) {
                throw new ConflictException('Tidak bisa mengubah janji temu yang sudah selesai');
            }

            if (appointment.status === AppointmentStatus.DIBATALKAN) {
                throw new ConflictException('Tidak bisa mengubah janji temu yang sudah dibatalkan');
            }

            Object.assign(appointment, updateAppointmentDto);
            const updated = await this.appointmentRepository.save(appointment);

            this.logger.log(`Appointment #${id} updated`);

            return updated;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }

            this.logger.error(`Error updating appointment ID ${id}:`, error);
            throw new BadRequestException('Gagal mengupdate janji temu');
        }
    }

    /**
     * Hapus appointment
     */
    async remove(id: number): Promise<void> {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: ['medical_record'],
            });

            if (!appointment) {
                throw new NotFoundException(`Janji temu dengan ID #${id} tidak ditemukan`);
            }

            // VALIDASI: Jangan hapus appointment yang sudah ada rekam medis
            if (appointment.medical_record) {
                throw new ConflictException(
                    'Tidak bisa menghapus janji temu yang sudah memiliki rekam medis'
                );
            }

            // BATALKAN REMINDER jika ada
            try {
                await this.notificationsService.cancelRemindersFor(appointment.id);
            } catch (error) {
                this.logger.error('Failed to cancel reminders:', error);
            }

            await this.appointmentRepository.remove(appointment);

            this.logger.log(`Appointment #${id} deleted`);

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }

            this.logger.error(`Error deleting appointment ID ${id}:`, error);
            throw new BadRequestException('Gagal menghapus janji temu');
        }
    }
}