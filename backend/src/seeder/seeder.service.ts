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
            { name: UserRole.KEPALA_KLINIK, description: 'Akses untuk kepala klinik' }
        ]);
    }

    private async seedUsers() {
        this.logger.log('Seeding tabel users...');
        const kepalaKlinikRole = await this.roleRepo.findOneBy({ name: UserRole.KEPALA_KLINIK });
        const dokterRole = await this.roleRepo.findOneBy({ name: UserRole.DOKTER });
        const stafRole = await this.roleRepo.findOneBy({ name: UserRole.STAF });

        if (!dokterRole || !stafRole || !kepalaKlinikRole) {
            this.logger.error('Role Dokter, Kepala Klinik atau Staf tidak ditemukan. Seeding users dibatalkan.');
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
            {
                nama_lengkap: 'Siti Rahma',
                username: 'siti.kepala',
                password: hashedPassword,
                roles: [kepalaKlinikRole], // Langsung assign array
            }
        ]);
    }

    private async seedPatients() {
        this.logger.log('Seeding tabel patients...');

        const patients = [
            {
                nama_lengkap: 'Andi Wijaya',
                nik: '1234567890123456',
                nomor_rekam_medis: '20250831-001',
                tanggal_lahir: new Date('1990-04-12'),
                jenis_kelamin: 'L' as 'L' | 'P',
                alamat: 'Jl. Melati No. 12, Bandung',
                email: 'andi.wijaya@example.com',
                no_hp: '081234567890',
                is_registered_online: 1,
            },
            {
                nama_lengkap: 'Dewi Anggraini',
                nik: '0987654321098765',
                nomor_rekam_medis: '20250831-002',
                tanggal_lahir: new Date('1992-09-25'),
                jenis_kelamin: 'P' as 'L' | 'P',
                alamat: 'Jl. Kenanga No. 8, Jakarta',
                email: 'dewi.anggraini@example.com',
                no_hp: '081298765432',
                is_registered_online: 1,
            },
            {
                nama_lengkap: 'Rizki Pratama',
                nik: '3216549870123456',
                nomor_rekam_medis: '20250831-003',
                tanggal_lahir: new Date('1988-12-05'),
                jenis_kelamin: 'L' as 'L' | 'P',
                alamat: 'Jl. Anggrek No. 3, Surabaya',
                email: 'rizki.pratama@example.com',
                no_hp: '081355512345',
                is_registered_online: 0,
            },
            {
                nama_lengkap: 'Siti Rahmawati',
                nik: '6543210987654321',
                nomor_rekam_medis: '20250831-004',
                tanggal_lahir: new Date('1995-01-15'),
                jenis_kelamin: 'P' as 'L' | 'P',
                alamat: 'Jl. Merpati No. 20, Medan',
                email: 'siti.rahmawati@example.com',
                no_hp: '081244478901',
                is_registered_online: 1,
            },
            {
                nama_lengkap: 'Budi Santoso',
                nik: '5678901234567890',
                nomor_rekam_medis: '20250831-005',
                tanggal_lahir: new Date('1987-07-09'),
                jenis_kelamin: 'L' as 'L' | 'P',
                alamat: 'Jl. Mawar No. 5, Yogyakarta',
                email: 'budi.santoso@example.com',
                no_hp: '081377765432',
                is_registered_online: 0,
            },
        ];

        await this.patientRepo.save(patients as any);

        this.logger.log('✅ Tabel patients berhasil di-seed.');
    }

    private async seedAppointments() {
        try {
            this.logger.log('📅 Seeding tabel appointments...');

            const dokter = await this.userRepo.findOne({
                where: { username: 'anisa.putri' },
                relations: ['roles']
            });
            const patient1 = await this.patientRepo.findOneBy({ nik: '1234567890123456' });
            const patient2 = await this.patientRepo.findOneBy({ nik: '0987654321098765' });

            if (!dokter || !patient1 || !patient2) {
                this.logger.error('❌ Dokter atau Pasien tidak ditemukan. Seeding appointments dibatalkan.');
                return;
            }

            // ✅ CARA 1: Simpan dengan ID eksplisit
            const appointment1 = await this.appointmentRepo.save({
                patient_id: patient1.id,  // ✅ Gunakan ID langsung
                doctor_id: dokter.id,     // ✅ Gunakan ID langsung
                tanggal_janji: new Date('2025-09-01'),
                jam_janji: '09:00:00',
                status: AppointmentStatus.SELESAI,
                keluhan: 'Gigi berlubang',
            });

            await this.appointmentRepo.save({
                patient_id: patient2.id,  // ✅ Gunakan ID langsung
                doctor_id: dokter.id,     // ✅ Gunakan ID langsung
                tanggal_janji: new Date('2025-09-01'),
                jam_janji: '10:00:00',
                status: AppointmentStatus.DIJADWALKAN,
                keluhan: 'Scaling rutin',
            });

            // Seed medical record
            await this.medicalRecordRepo.save({
                appointment_id: appointment1.id,  // ✅ Gunakan ID langsung
                user_id_staff: dokter.id,
                subjektif: 'Pasien mengeluh sakit gigi',
                objektif: 'Terdapat karies pada gigi geraham',
                assessment: 'Gigi berlubang ringan',
                plan: 'Penambalan komposit',
            });

            this.logger.log('✅ Appointments berhasil di-seed');
        } catch (error) {
            this.logger.error('❌ Error saat seed appointments:', error);
            throw error;
        }
    }
}