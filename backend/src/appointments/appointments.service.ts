import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
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

        const patient = await this.patientRepository.findOneBy({ id: patient_id });
        if (!patient) {
            throw new NotFoundException(`Pasien dengan ID #${patient_id} tidak ditemukan`);
        }

        const doctor = await this.userRepository.findOne({
            where: { id: doctor_id },
            relations: ['roles'],
        });
        
        if (!doctor) {
            throw new NotFoundException(`Dokter dengan ID #${doctor_id} tidak ditemukan`);
        }

        // 🔥 IMPLEMENTASI: Validasi role dokter
        const isDokter = doctor.roles.some(role => role.name === UserRole.DOKTER);
        const isKepalaKlinik = doctor.roles.some(role => role.name === UserRole.KEPALA_KLINIK);
        
        if (!isDokter && !isKepalaKlinik) {
            throw new ForbiddenException(`User dengan ID #${doctor_id} bukan dokter atau kepala klinik.`);
        }

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

        let dateFilter = {};
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            dateFilter = { tanggal_janji: Between(startDate, endDate) };
        }

        const whereConditions: any = { ...dateFilter };

        const isDoctor = user.roles.some(role => role.name === UserRole.DOKTER);
        const isKepalaKlinik = user.roles.some(role => role.name === UserRole.KEPALA_KLINIK);
        
        // Dokter hanya bisa lihat appointmentnya sendiri
        // Kepala Klinik bisa lihat semua appointment atau filter by doctorId
        if (isDoctor && !isKepalaKlinik) {
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
        
        if (appointment.status !== AppointmentStatus.DIJADWALKAN) {
            throw new ConflictException(`Hanya janji temu yang 'dijadwalkan' yang bisa diselesaikan.`);
        }
        
        appointment.status = AppointmentStatus.SELESAI;
        return this.appointmentRepository.save(appointment);
    }

    async cancel(id: number, user: User): Promise<Appointment> {
        const appointment = await this.findOne(id, user);
        
        if (appointment.status === AppointmentStatus.SELESAI) {
            throw new ConflictException(`Janji temu yang sudah 'selesai' tidak bisa dibatalkan.`);
        }
        
        appointment.status = AppointmentStatus.DIBATALKAN;
        
        // 🔥 IMPLEMENTASI: Batalkan notifikasi yang terjadwal
        await this.notificationsService.cancelRemindersFor(appointment.id);
        
        return this.appointmentRepository.save(appointment);
    }

    async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
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