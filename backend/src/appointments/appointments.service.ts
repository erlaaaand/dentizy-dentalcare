import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/roles/entities/role.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { Between } from 'typeorm';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
        const { patient_id, doctor_id, tanggal_janji, jam_janji } = createAppointmentDto;

        // Validasi apakah pasien ada
        const patient = await this.patientRepository.findOneBy({ id: patient_id });
        if (!patient) {
            throw new NotFoundException(`Pasien dengan ID #${patient_id} tidak ditemukan`);
        }

        // Validasi apakah user (dokter) ada
        const doctor = await this.userRepository.findOneBy({ id: doctor_id });
        if (!doctor) {
            throw new NotFoundException(`Dokter dengan ID #${doctor_id} tidak ditemukan`);
        }
        // Anda bisa tambahkan validasi role dokter di sini

        const existingAppointment = await this.appointmentRepository.findOne({
            where: {
                doctor_id: doctor_id,
                tanggal_janji: new Date(tanggal_janji),
                jam_janji: jam_janji,
            },
        });

        if (existingAppointment) {
            throw new ConflictException(
                `Dokter sudah memiliki janji temu di tanggal dan jam tersebut.`,
            );
        }

        const newAppointment = this.appointmentRepository.create({
            ...createAppointmentDto,
            patient,
            doctor,
        });
        const savedAppointment = await this.appointmentRepository.save(newAppointment);

        if (savedAppointment.patient.email && savedAppointment.patient.is_registered_online) {
            await this.notificationsService.scheduleAppointmentReminder(savedAppointment);
        }

        return savedAppointment;
    }

    async findAll(user: User, queryDto: FindAppointmentsQueryDto) {
        const { doctorId, date, status, page = 1, limit = 10 } = queryDto;
        const skip = (page - 1) * limit;

        // --- PERBAIKAN LOGIKA FILTER TANGGAL ---
        let dateFilter = {};
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0); // Set ke awal hari

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999); // Set ke akhir hari

            dateFilter = { tanggal_janji: Between(startDate, endDate) };
        }
        // --- AKHIR PERBAIKAN ---

        const whereConditions: any = { ...dateFilter };

        const isDoctor = user.roles.some(role => role.name === UserRole.DOKTER);
        if (isDoctor) {
            whereConditions.doctor = { id: user.id };
        } else if (doctorId) {
            whereConditions.doctor = { id: doctorId };
        }

        if (status) {
            whereConditions.status = status;
        }

        const [appointments, total] = await this.appointmentRepository.findAndCount({
            where: whereConditions,
            relations: ['patient', 'doctor'],
            order: {
                tanggal_janji: 'DESC',
                jam_janji: 'ASC'
            },
            take: limit,
            skip: skip,
        });

        return {
            data: appointments,
            count: total,
            page,
            limit,
        };
    }

    async findOne(id: number, user: User): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'medical_record'],
        });

        if (!appointment) {
            throw new NotFoundException(`Janji temu dengan ID #${id} tidak ditemukan`);
        }
        return appointment;
    }

    async complete(id: number, user: User): Promise<Appointment> {
        const appointment = await this.findOne(id, user);
        // PENYEMPURNAAN: Validasi alur status
        if (appointment.status !== AppointmentStatus.DIJADWALKAN) {
            throw new ConflictException(`Hanya janji temu yang 'dijadwalkan' yang bisa diselesaikan.`);
        }
        appointment.status = AppointmentStatus.SELESAI;
        return this.appointmentRepository.save(appointment);
    }

    async cancel(id: number, user: User): Promise<Appointment> {
        const appointment = await this.findOne(id, user);
        // PENYEMPURNAAN: Validasi alur status
        if (appointment.status === AppointmentStatus.SELESAI) {
            throw new ConflictException(`Janji temu yang sudah 'selesai' tidak bisa dibatalkan.`);
        }
        appointment.status = AppointmentStatus.DIBATALKAN;
        // PERBAIKAN BUG: Nonaktifkan pemanggilan fungsi yang belum ada
        // TODO: Implementasikan logika untuk membatalkan notifikasi
        // await this.notificationsService.cancelRemindersFor(appointment.id);
        return this.appointmentRepository.save(appointment);
    }

    async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
        // Untuk keamanan, sebaiknya findOne juga menyertakan user, tapi karena hanya staf
        // yang bisa mengakses ini, kita bisa biarkan untuk saat ini.
        const appointment = await this.appointmentRepository.findOneBy({ id });
        if (!appointment) throw new NotFoundException('Appointment not found');
        Object.assign(appointment, updateAppointmentDto);
        return this.appointmentRepository.save(appointment);
    }

    async remove(id: number): Promise<void> {
        const appointment = await this.appointmentRepository.findOneBy({ id });
        if (!appointment) throw new NotFoundException('Appointment not found');
        await this.appointmentRepository.remove(appointment);
    }
}