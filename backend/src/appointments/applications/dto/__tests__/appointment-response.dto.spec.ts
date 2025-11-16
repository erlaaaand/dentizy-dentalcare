import { AppointmentResponseDto, PaginatedAppointmentResponseDto } from './../appointment-response.dto';
// Kita perlu mock enum AppointmentStatus karena kita tidak mengimpor file entity aslinya
import { AppointmentStatus } from '../../../domains/entities/appointment.entity';

describe('Appointment DTOs', () => {

  // --- Mock Data ---
  const mockDate = new Date('2025-11-16T10:00:00.000Z');

  const mockPatient = {
    id: 1,
    nama_lengkap: 'Budi Santoso',
    nomor_rekam_medis: 'RM-001',
    email: 'budi@example.com',
    nomor_telepon: '08123456789',
  };

  const mockDoctor = {
    id: 2,
    nama_lengkap: 'Dr. Gigi',
    roles: ['doctor'],
  };

  const mockMedicalRecord = {
    id: 1,
    appointment_id: 1,
    subjektif: 'Pasien mengeluh sakit gigi',
    objektif: 'Terdapat karies',
    assessment: 'Karies profunda',
    plan: 'Tambal gigi',
    created_at: mockDate,
    updated_at: mockDate,
    patient_id: 1,
    doctor_id: 2,
  };

  const mockAppointment: AppointmentResponseDto = {
    id: 1,
    patient_id: 1,
    doctor_id: 2,
    status: AppointmentStatus.DIJADWALKAN,
    tanggal_janji: mockDate,
    jam_janji: '09:00:00',
    keluhan: 'Sakit gigi berlubang',
    created_at: mockDate,
    updated_at: mockDate,
    patient: mockPatient,
    doctor: mockDoctor,
    medical_record: mockMedicalRecord,
  };

  // --- Test Suite untuk AppointmentResponseDto ---
  describe('AppointmentResponseDto', () => {
    it('should correctly create an instance and assign properties', () => {
      const dto = new AppointmentResponseDto();

      // Menggunakan Object.assign untuk meniru mapping (seperti dari service)
      Object.assign(dto, mockAppointment);

      expect(dto.id).toBe(1);
      expect(dto.patient_id).toBe(1);
      expect(dto.doctor_id).toBe(2);
      expect(dto.status).toBe(AppointmentStatus.DIJADWALKAN);
      expect(dto.keluhan).toBe('Sakit gigi berlubang');
      expect(dto.created_at).toBe(mockDate);

      // Memeriksa relasi
      expect(dto.patient).toBeDefined();
      expect(dto.patient?.nama_lengkap).toBe('Budi Santoso');
      expect(dto.patient?.nomor_rekam_medis).toBe('RM-001');

      expect(dto.doctor).toBeDefined();
      expect(dto.doctor?.nama_lengkap).toBe('Dr. Gigi');

      expect(dto.medical_record).toBeDefined();
      expect(dto.medical_record?.assessment).toBe('Karies profunda');
    });

    it('should handle optional properties being undefined', () => {
      const partialAppointment = { ...mockAppointment };
      delete partialAppointment.keluhan;
      delete partialAppointment.patient;
      delete partialAppointment.doctor;
      delete partialAppointment.medical_record;

      const dto = new AppointmentResponseDto();
      Object.assign(dto, partialAppointment);

      expect(dto.id).toBe(1);
      expect(dto.keluhan).toBeUndefined();
      expect(dto.patient).toBeUndefined();
      expect(dto.doctor).toBeUndefined();
      expect(dto.medical_record).toBeUndefined();
    });
  });

  // --- Test Suite untuk PaginatedAppointmentResponseDto ---
  describe('PaginatedAppointmentResponseDto', () => {
    it('should correctly create an instance and assign properties', () => {
      const mockPaginatedResponse: PaginatedAppointmentResponseDto = {
        data: [mockAppointment], // data adalah array dari AppointmentResponseDto
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      const dto = new PaginatedAppointmentResponseDto();

      // Saat data di-map, 'data' akan menjadi array dari instance
      dto.data = mockPaginatedResponse.data.map(item => {
        const appDto = new AppointmentResponseDto();
        Object.assign(appDto, item);
        return appDto;
      });
      dto.count = mockPaginatedResponse.count;
      dto.page = mockPaginatedResponse.page;
      dto.limit = mockPaginatedResponse.limit;
      dto.totalPages = mockPaginatedResponse.totalPages;

      expect(dto.count).toBe(1);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
      expect(dto.totalPages).toBe(1);
      expect(dto.data).toBeInstanceOf(Array);
      expect(dto.data.length).toBe(1);

      // Memastikan data di dalam array adalah instance yang benar
      expect(dto.data[0]).toBeInstanceOf(AppointmentResponseDto);
      expect(dto.data[0].id).toBe(1);
      expect(dto.data[0].patient?.nama_lengkap).toBe('Budi Santoso');
    });
  });
});