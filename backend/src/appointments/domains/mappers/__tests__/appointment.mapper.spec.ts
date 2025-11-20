import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentMapper } from '../appointment.mapper';
import { Appointment, AppointmentStatus } from '../../entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { Patient } from '../../../../patients/domains/entities/patient.entity';
import { MedicalRecord } from '../../../../medical_records/domains/entities/medical-record.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

describe('AppointmentMapper', () => {
  let mapper: AppointmentMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentMapper],
    }).compile();

    mapper = module.get<AppointmentMapper>(AppointmentMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('toResponseDto', () => {
    it('should map basic appointment entity to response DTO', () => {
      const appointment: Partial<Appointment> = {
        id: 1,
        patient_id: 10,
        doctor_id: 20,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: new Date('2024-11-20'),
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-15'),
      };

      const result = mapper.toResponseDto(appointment as Appointment);

      expect(result.id).toBe(1);
      expect(result.patient_id).toBe(10);
      expect(result.doctor_id).toBe(20);
      expect(result.status).toBe(AppointmentStatus.DIJADWALKAN);
      expect(result.tanggal_janji).toEqual(new Date('2024-11-20'));
      expect(result.jam_janji).toBe('10:00:00');
      expect(result.keluhan).toBe('Sakit kepala');
      expect(result.patient).toBeUndefined();
      expect(result.doctor).toBeUndefined();
      expect(result.medical_record).toBeUndefined();
    });

    it('should map appointment with patient relation', () => {
      const patient: Partial<Patient> = {
        id: 10,
        nama_lengkap: 'John Doe',
        nomor_rekam_medis: 'MR001',
        email: 'john@example.com',
        no_hp: '08123456789',
      };

      const appointment: Partial<Appointment> = {
        id: 1,
        patient_id: 10,
        doctor_id: 20,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: new Date('2024-11-20'),
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-15'),
        patient: patient as Patient,
      };

      const result = mapper.toResponseDto(appointment as Appointment);

      expect(result.patient).toBeDefined();
      expect(result.patient!.id).toBe(10);
      expect(result.patient!.nama_lengkap).toBe('John Doe');
      expect(result.patient!.nomor_rekam_medis).toBe('MR001');
      expect(result.patient!.email).toBe('john@example.com');
      expect(result.patient!.nomor_telepon).toBe('08123456789');
    });

    it('should map appointment with doctor relation', () => {
      const doctor: Partial<User> = {
        id: 20,
        nama_lengkap: 'Dr. Smith',
        roles: [
          { id: 1, name: UserRole.DOKTER, description: 'Doctor' } as any,
        ],
      };

      const appointment: Partial<Appointment> = {
        id: 1,
        patient_id: 10,
        doctor_id: 20,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: new Date('2024-11-20'),
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-15'),
        doctor: doctor as User,
      };

      const result = mapper.toResponseDto(appointment as Appointment);

      expect(result.doctor).toBeDefined();
      expect(result.doctor!.id).toBe(20);
      expect(result.doctor!.nama_lengkap).toBe('Dr. Smith');
      expect(result.doctor!.roles).toEqual([UserRole.DOKTER]);
    });

    it('should map appointment with medical record relation', () => {
      const medicalRecord: Partial<MedicalRecord> = {
        id: 100,
        appointment_id: 1,
        patient_id: 10,
        doctor_id: 20,
        subjektif: 'Keluhan pasien',
        objektif: 'Hasil pemeriksaan',
        assessment: 'Diagnosa',
        plan: 'Rencana perawatan',
        created_at: new Date('2024-11-20'),
        updated_at: new Date('2024-11-20'),
      };

      const appointment: Partial<Appointment> = {
        id: 1,
        patient_id: 10,
        doctor_id: 20,
        status: AppointmentStatus.SELESAI,
        tanggal_janji: new Date('2024-11-20'),
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-15'),
        medical_record: medicalRecord as MedicalRecord,
      };

      const result = mapper.toResponseDto(appointment as Appointment);

      expect(result.medical_record).toBeDefined();
      expect(result.medical_record!.id).toBe(100);
      expect(result.medical_record!.appointment_id).toBe(1);
      expect(result.medical_record!.subjektif).toBe('Keluhan pasien');
      expect(result.medical_record!.objektif).toBe('Hasil pemeriksaan');
      expect(result.medical_record!.assessment).toBe('Diagnosa');
      expect(result.medical_record!.plan).toBe('Rencana perawatan');
    });

    it('should map appointment with all relations', () => {
      const patient: Partial<Patient> = {
        id: 10,
        nama_lengkap: 'John Doe',
        nomor_rekam_medis: 'MR001',
        email: 'john@example.com',
        no_hp: '08123456789',
      };

      const doctor: Partial<User> = {
        id: 20,
        nama_lengkap: 'Dr. Smith',
        roles: [
          { id: 1, name: UserRole.DOKTER, description: 'Doctor' } as any,
          { id: 2, name: UserRole.KEPALA_KLINIK, description: 'Clinic Head' } as any,
        ],
      };

      const medicalRecord: Partial<MedicalRecord> = {
        id: 100,
        appointment_id: 1,
        patient_id: 10,
        doctor_id: 20,
        subjektif: 'Keluhan pasien',
        objektif: 'Hasil pemeriksaan',
        assessment: 'Diagnosa',
        plan: 'Rencana perawatan',
        created_at: new Date('2024-11-20'),
        updated_at: new Date('2024-11-20'),
      };

      const appointment: Partial<Appointment> = {
        id: 1,
        patient_id: 10,
        doctor_id: 20,
        status: AppointmentStatus.SELESAI,
        tanggal_janji: new Date('2024-11-20'),
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-15'),
        patient: patient as Patient,
        doctor: doctor as User,
        medical_record: medicalRecord as MedicalRecord,
      };

      const result = mapper.toResponseDto(appointment as Appointment);

      expect(result.patient).toBeDefined();
      expect(result.doctor).toBeDefined();
      expect(result.medical_record).toBeDefined();
      expect(result.doctor!.roles).toEqual([UserRole.DOKTER, UserRole.KEPALA_KLINIK]);
    });

    it('should handle doctor without roles', () => {
      const doctor: Partial<User> = {
        id: 20,
        nama_lengkap: 'Dr. Smith',
        roles: undefined,
      };

      const appointment: Partial<Appointment> = {
        id: 1,
        patient_id: 10,
        doctor_id: 20,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: new Date('2024-11-20'),
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
        created_at: new Date('2024-11-15'),
        updated_at: new Date('2024-11-15'),
        doctor: doctor as User,
      };

      const result = mapper.toResponseDto(appointment as Appointment);

      expect(result.doctor).toBeDefined();
      expect(result.doctor!.roles).toBeUndefined();
    });
  });

  describe('toResponseDtoList', () => {
    it('should map empty array', () => {
      const result = mapper.toResponseDtoList([]);
      expect(result).toEqual([]);
    });

    it('should map array of appointments', () => {
      const appointments: Partial<Appointment>[] = [
        {
          id: 1,
          patient_id: 10,
          doctor_id: 20,
          status: AppointmentStatus.DIJADWALKAN,
          tanggal_janji: new Date('2024-11-20'),
          jam_janji: '10:00:00',
          keluhan: 'Sakit kepala',
          created_at: new Date('2024-11-15'),
          updated_at: new Date('2024-11-15'),
        },
        {
          id: 2,
          patient_id: 11,
          doctor_id: 21,
          status: AppointmentStatus.SELESAI,
          tanggal_janji: new Date('2024-11-21'),
          jam_janji: '14:00:00',
          keluhan: 'Demam',
          created_at: new Date('2024-11-16'),
          updated_at: new Date('2024-11-16'),
        },
      ];

      const result = mapper.toResponseDtoList(appointments as Appointment[]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should map array with relations', () => {
      const patient: Partial<Patient> = {
        id: 10,
        nama_lengkap: 'John Doe',
        nomor_rekam_medis: 'MR001',
        email: 'john@example.com',
        no_hp: '08123456789',
      };

      const appointments: Partial<Appointment>[] = [
        {
          id: 1,
          patient_id: 10,
          doctor_id: 20,
          status: AppointmentStatus.DIJADWALKAN,
          tanggal_janji: new Date('2024-11-20'),
          jam_janji: '10:00:00',
          keluhan: 'Sakit kepala',
          created_at: new Date('2024-11-15'),
          updated_at: new Date('2024-11-15'),
          patient: patient as Patient,
        },
      ];

      const result = mapper.toResponseDtoList(appointments as Appointment[]);

      expect(result[0].patient).toBeDefined();
      expect(result[0].patient!.nama_lengkap).toBe('John Doe');
    });
  });

  describe('toPaginatedResponse', () => {
    it('should create paginated response with correct metadata', () => {
      const appointments: Partial<Appointment>[] = [
        {
          id: 1,
          patient_id: 10,
          doctor_id: 20,
          status: AppointmentStatus.DIJADWALKAN,
          tanggal_janji: new Date('2024-11-20'),
          jam_janji: '10:00:00',
          keluhan: 'Sakit kepala',
          created_at: new Date('2024-11-15'),
          updated_at: new Date('2024-11-15'),
        },
      ];

      const result = mapper.toPaginatedResponse(
        appointments as Appointment[],
        25,
        1,
        10
      );

      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    it('should calculate total pages correctly', () => {
      const result1 = mapper.toPaginatedResponse([], 100, 1, 10);
      expect(result1.totalPages).toBe(10);

      const result2 = mapper.toPaginatedResponse([], 95, 1, 10);
      expect(result2.totalPages).toBe(10);

      const result3 = mapper.toPaginatedResponse([], 101, 1, 10);
      expect(result3.totalPages).toBe(11);
    });

    it('should handle empty results', () => {
      const result = mapper.toPaginatedResponse([], 0, 1, 10);

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should handle different page sizes', () => {
      const appointments: Partial<Appointment>[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          patient_id: 10,
          doctor_id: 20,
          status: AppointmentStatus.DIJADWALKAN,
          tanggal_janji: new Date('2024-11-20'),
          jam_janji: '10:00:00',
          keluhan: 'Sakit kepala',
          created_at: new Date('2024-11-15'),
          updated_at: new Date('2024-11-15'),
        }));

      const result = mapper.toPaginatedResponse(
        appointments as Appointment[],
        50,
        2,
        5
      );

      expect(result.data).toHaveLength(5);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(10);
    });
  });
});