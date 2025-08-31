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

        await this.notificationsService.scheduleAppointmentReminder(savedAppointment)

        return this.appointmentRepository.save(newAppointment);
    }

    async findAll(user: User, queryDto: FindAppointmentsQueryDto): Promise<Appointment[]> {
        const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.patient', 'patient')
            .leftJoinAndSelect('appointment.doctor', 'doctor');

        // --- INTI LOGIKA OTORISASI ---
        // Cek apakah user yang request adalah seorang dokter
        const isDoctor = user.roles.some(role => role.name === UserRole.DOKTER);

        if (isDoctor) {
            // Jika dokter, tambahkan filter WHERE untuk hanya menampilkan janji temu miliknya
            queryBuilder.where('appointment.doctor_id = :doctorId', { doctorId: user.id });
        }
        // Jika bukan dokter (misalnya staf), tidak ada filter tambahan, jadi semua data akan tampil.
        // --- AKHIR LOGIKA OTORISASI ---

        // Di sini kita bisa tambahkan logika untuk filter & paginasi dari queryDto nanti

        return await queryBuilder.getMany();
    }

    async findOne(id: number): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'medical_record'],
        });

        if (!appointment) {
            throw new NotFoundException(`Janji temu dengan ID #${id} tidak ditemukan`);
        }
        return appointment;
    }

    async complete(id: number): Promise<Appointment> {
        const appointment = await this.findOne(id);
        appointment.status = AppointmentStatus.SELESAI;
        return this.appointmentRepository.save(appointment);
    }

    async cancel(id: number): Promise<Appointment> {
        const appointment = await this.findOne(id);
        appointment.status = AppointmentStatus.DIBATALKAN;
        await this.notificationsService.cancelRemindersFor(appointment.id);
        return this.appointmentRepository.save(appointment);
    }

    async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
        const appointment = await this.findOne(id);
        Object.assign(appointment, updateAppointmentDto);
        return this.appointmentRepository.save(appointment);
    }

    async remove(id: number): Promise<void> {
        const appointment = await this.findOne(id);
        await this.appointmentRepository.remove(appointment);
    }
}