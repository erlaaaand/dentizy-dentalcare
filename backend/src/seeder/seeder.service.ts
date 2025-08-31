import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, UserRole } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import * as bcrypt from 'bcrypt';
import { MedicalRecord } from 'src/medical_records/entities/medical_record.entity';

@Injectable()
export class SeederService {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Patient) private readonly patientRepo: Repository<Patient>,
        @InjectRepository(Appointment) private readonly appointmentRepo: Repository<Appointment>,
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepo: Repository<MedicalRecord>,
    ) { }

    async seed() {
        this.logger.log('Memulai proses seeding database...');

        // 1. Seed Roles (jika kosong)
        if (await this.roleRepo.count() === 0) {
            await this.seedRoles();
        }

        // 2. Seed Users (jika kosong)
        if (await this.userRepo.count() === 0) {
            await this.seedUsers();
        }

        // 3. Seed Patients (jika kosong)
        if (await this.patientRepo.count() === 0) {
            await this.seedPatients();
        }

        // 4. Seed Appointments (jika kosong)
        if (await this.appointmentRepo.count() === 0) {
            await this.seedAppointments();
        }

        this.logger.log('Seeding selesai.');
    }

    private async seedRoles() {
        this.logger.log('Seeding tabel roles...');
        await this.roleRepo.save([
            { name: UserRole.DOKTER, description: 'Akses untuk dokter' },
            { name: UserRole.STAF, description: 'Akses untuk staf administrasi' },
        ]);
    }

    private async seedUsers() {
        this.logger.log('Seeding tabel users...');
        const dokterRole = await this.roleRepo.findOneBy({ name: UserRole.DOKTER });
        const stafRole = await this.roleRepo.findOneBy({ name: UserRole.STAF });

        if (!dokterRole || !stafRole) {
            this.logger.error('Role Dokter atau Staf tidak ditemukan. Seeding users dibatalkan.');
            return;
        }

        const hashedPassword = await bcrypt.hash('password123', 10);

        // Hapus `as Partial<User>[]` dan pastikan `roles` selalu array
        await this.userRepo.save([
            {
                nama_lengkap: 'Dr. Anisa Putri',
                username: 'anisa.putri',
                password: hashedPassword,
                roles: [dokterRole], // Langsung assign array
            },
            {
                nama_lengkap: 'Budi Santoso',
                username: 'budi.staf',
                password: hashedPassword,
                roles: [stafRole], // Langsung assign array
            },
        ]);
    }

    private async seedPatients() {
        this.logger.log('Seeding tabel patients...');
        await this.patientRepo.save([
            { nama_lengkap: 'Citra Lestari', nik: '1234567890123456', nomor_rekam_medis: '20250831-001' },
            { nama_lengkap: 'Dewi Anggraini', nik: '0987654321098765', nomor_rekam_medis: '20250831-002' },
        ]);
    }

    private async seedAppointments() {
        this.logger.log('Seeding tabel appointments...');
        const dokter = await this.userRepo.findOneBy({ username: 'anisa.putri' });
        const patient1 = await this.patientRepo.findOneBy({ nik: '1234567890123456' });
        const patient2 = await this.patientRepo.findOneBy({ nik: '0987654321098765' });
        
        if (!dokter || !patient1 || !patient2) {
            this.logger.error('Dokter atau Pasien tidak ditemukan. Seeding appointments dibatalkan.');
            return; // Hentikan fungsi jika ada data yang tidak ditemukan
        }
        
        const appointment1 = await this.appointmentRepo.save({
            patients: patient1,
            doctor: dokter,
            tanggal_janji: new Date('2025-09-01'),
            jam_janji: '09:00:00',
            status: AppointmentStatus.SELESAI,
        });


        await this.appointmentRepo.save({
            patients: patient2,
            doctor: dokter,
            tanggal_janji: new Date('2025-09-01'),
            jam_janji: '10:00:00',
            status: AppointmentStatus.DIJADWALKAN,
        });

        // Seed medical record untuk appointment yang sudah selesai
        await this.medicalRecordRepo.save({
            appointments: appointment1,
            user_id_staff: dokter.id,
            assessment: 'Gigi berlubang ringan',
            plan: 'Penambalan komposit',
        });
    }
}