import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentDomainService } from '../appointment-domain.service';
import {
  Appointment,
  AppointmentStatus,
} from '../../entities/appointment.entity';
import { User } from '../../../../users/domains/entities/user.entity';
import { Patient } from '../../../../patients/domains/entities/patient.entity';
import { CreateAppointmentDto } from '../../../applications/dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../../../applications/dto/update-appointment.dto';

describe('AppointmentDomainService', () => {
  let service: AppointmentDomainService;

  // Mock data
  const mockPatient: Patient = {
    id: 10,
    nama_lengkap: 'John Doe',
    email: 'john@example.com',
    is_registered_online: true,
  } as Patient;

  const mockDoctor: User = {
    id: 20,
    nama_lengkap: 'Dr. Smith',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentDomainService],
    }).compile();

    service = module.get<AppointmentDomainService>(AppointmentDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAppointmentEntity', () => {
    it('should create appointment entity from DTO', () => {
      const dto: CreateAppointmentDto = {
        patient_id: 10,
        doctor_id: 20,
        tanggal_janji: '2024-11-20',
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
      };

      const tanggalJanji = new Date('2024-11-20');

      const result = service.createAppointmentEntity(
        dto,
        mockPatient,
        mockDoctor,
        tanggalJanji,
      );

      expect(result.patient_id).toBe(10);
      expect(result.doctor_id).toBe(20);
      expect(result.tanggal_janji).toEqual(tanggalJanji);
      expect(result.jam_janji).toBe('10:00:00');
      expect(result.keluhan).toBe('Sakit kepala');
      expect(result.status).toBe(AppointmentStatus.DIJADWALKAN);
      expect(result.patient).toBe(mockPatient);
      expect(result.doctor).toBe(mockDoctor);
    });

    it('should use provided status from DTO', () => {
      const dto: CreateAppointmentDto = {
        patient_id: 10,
        doctor_id: 20,
        tanggal_janji: '2024-11-20',
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
        status: AppointmentStatus.SELESAI,
      };

      const result = service.createAppointmentEntity(
        dto,
        mockPatient,
        mockDoctor,
        new Date('2024-11-20'),
      );

      expect(result.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should default to DIJADWALKAN when status not provided', () => {
      const dto: CreateAppointmentDto = {
        patient_id: 10,
        doctor_id: 20,
        tanggal_janji: '2024-11-20',
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
      };

      const result = service.createAppointmentEntity(
        dto,
        mockPatient,
        mockDoctor,
        new Date('2024-11-20'),
      );

      expect(result.status).toBe(AppointmentStatus.DIJADWALKAN);
    });
  });

  describe('updateAppointmentEntity', () => {
    let appointment: Appointment;

    beforeEach(() => {
      appointment = {
        id: 1,
        patient_id: 10,
        doctor_id: 20,
        status: AppointmentStatus.DIJADWALKAN,
        tanggal_janji: new Date('2024-11-20'),
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
      } as Appointment;
    });

    it('should update status when provided', () => {
      const updateDto: UpdateAppointmentDto = {
        status: AppointmentStatus.SELESAI,
      };

      const result = service.updateAppointmentEntity(appointment, updateDto);

      expect(result.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should update tanggal_janji when provided', () => {
      const updateDto: UpdateAppointmentDto = {
        tanggal_janji: '2024-11-25',
      };

      const result = service.updateAppointmentEntity(appointment, updateDto);

      expect(result.tanggal_janji).toEqual(new Date('2024-11-25'));
    });

    it('should update jam_janji when provided', () => {
      const updateDto: UpdateAppointmentDto = {
        jam_janji: '14:00:00',
      };

      const result = service.updateAppointmentEntity(appointment, updateDto);

      expect(result.jam_janji).toBe('14:00:00');
    });

    it('should update keluhan when provided', () => {
      const updateDto: UpdateAppointmentDto = {
        keluhan: 'Demam tinggi',
      };

      const result = service.updateAppointmentEntity(appointment, updateDto);

      expect(result.keluhan).toBe('Demam tinggi');
    });

    it('should update multiple fields at once', () => {
      const updateDto: UpdateAppointmentDto = {
        status: AppointmentStatus.SELESAI,
        tanggal_janji: '2024-11-25',
        jam_janji: '14:00:00',
        keluhan: 'Demam tinggi',
      };

      const result = service.updateAppointmentEntity(appointment, updateDto);

      expect(result.status).toBe(AppointmentStatus.SELESAI);
      expect(result.tanggal_janji).toEqual(new Date('2024-11-25'));
      expect(result.jam_janji).toBe('14:00:00');
      expect(result.keluhan).toBe('Demam tinggi');
    });

    it('should not update fields when not provided', () => {
      const originalStatus = appointment.status;
      const originalDate = appointment.tanggal_janji;
      const originalTime = appointment.jam_janji;
      const originalKeluhan = appointment.keluhan;

      const updateDto: UpdateAppointmentDto = {};

      const result = service.updateAppointmentEntity(appointment, updateDto);

      expect(result.status).toBe(originalStatus);
      expect(result.tanggal_janji).toEqual(originalDate);
      expect(result.jam_janji).toBe(originalTime);
      expect(result.keluhan).toBe(originalKeluhan);
    });

    it('should return the same appointment instance', () => {
      const updateDto: UpdateAppointmentDto = {
        status: AppointmentStatus.SELESAI,
      };

      const result = service.updateAppointmentEntity(appointment, updateDto);

      expect(result).toBe(appointment);
    });
  });

  describe('completeAppointment', () => {
    it('should set status to SELESAI', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      const result = service.completeAppointment(appointment);

      expect(result.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should return the same appointment instance', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      const result = service.completeAppointment(appointment);

      expect(result).toBe(appointment);
    });
  });

  describe('cancelAppointment', () => {
    it('should set status to DIBATALKAN', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      const result = service.cancelAppointment(appointment);

      expect(result.status).toBe(AppointmentStatus.DIBATALKAN);
    });

    it('should return the same appointment instance', () => {
      const appointment: Appointment = {
        id: 1,
        status: AppointmentStatus.DIJADWALKAN,
      } as Appointment;

      const result = service.cancelAppointment(appointment);

      expect(result).toBe(appointment);
    });
  });

  describe('shouldScheduleReminder', () => {
    it('should return true when all conditions met', () => {
      const appointment: Appointment = {
        status: AppointmentStatus.DIJADWALKAN,
        patient: {
          email: 'john@example.com',
          is_registered_online: true,
        } as Patient,
      } as Appointment;

      const result = service.shouldScheduleReminder(appointment);

      expect(result).toBe(true);
    });

    it('should return false when patient has no email', () => {
      const appointment: Appointment = {
        status: AppointmentStatus.DIJADWALKAN,
        patient: {
          email: '',
          is_registered_online: true,
        } as Patient,
      } as Appointment;

      const result = service.shouldScheduleReminder(appointment);

      expect(result).toBe(false);
    });

    it('should return false when patient not registered online', () => {
      const appointment: Appointment = {
        status: AppointmentStatus.DIJADWALKAN,
        patient: {
          email: 'john@example.com',
          is_registered_online: false,
        } as Patient,
      } as Appointment;

      const result = service.shouldScheduleReminder(appointment);

      expect(result).toBe(false);
    });

    it('should return false when status is not DIJADWALKAN', () => {
      const appointment: Appointment = {
        status: AppointmentStatus.SELESAI,
        patient: {
          email: 'john@example.com',
          is_registered_online: true,
        } as Patient,
      } as Appointment;

      const result = service.shouldScheduleReminder(appointment);

      expect(result).toBe(false);
    });

    it('should return false when patient is null', () => {
      const appointment: Appointment = {
        status: AppointmentStatus.DIJADWALKAN,
        patient: {},
      } as Appointment;

      const result = service.shouldScheduleReminder(appointment);

      expect(result).toBe(false);
    });

    it('should return false when patient is undefined', () => {
      const appointment: Appointment = {
        status: AppointmentStatus.DIJADWALKAN,
        patient: {},
      } as Appointment;

      const result = service.shouldScheduleReminder(appointment);

      expect(result).toBe(false);
    });
  });

  describe('parseAppointmentDateTime', () => {
    it('should parse appointment date and time correctly', () => {
      const tanggalJanji = new Date('2024-11-20');
      const jamJanji = '10:30:45';

      const result = service.parseAppointmentDateTime(tanggalJanji, jamJanji);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(10); // November (0-indexed)
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(10);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should handle time without seconds', () => {
      const tanggalJanji = new Date('2024-11-20');
      const jamJanji = '14:00';

      const result = service.parseAppointmentDateTime(tanggalJanji, jamJanji);

      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle early morning time', () => {
      const tanggalJanji = new Date('2024-11-20');
      const jamJanji = '08:00:00';

      const result = service.parseAppointmentDateTime(tanggalJanji, jamJanji);

      expect(result.getHours()).toBe(8);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
    });

    it('should handle afternoon time', () => {
      const tanggalJanji = new Date('2024-11-20');
      const jamJanji = '16:30:00';

      const result = service.parseAppointmentDateTime(tanggalJanji, jamJanji);

      expect(result.getHours()).toBe(16);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(0);
    });
  });

  describe('isTimeUpdated', () => {
    it('should return true when tanggal_janji is updated', () => {
      const updateDto: UpdateAppointmentDto = {
        tanggal_janji: '2024-11-25',
      };

      const result = service.isTimeUpdated(updateDto);

      expect(result).toBe(true);
    });

    it('should return true when jam_janji is updated', () => {
      const updateDto: UpdateAppointmentDto = {
        jam_janji: '14:00:00',
      };

      const result = service.isTimeUpdated(updateDto);

      expect(result).toBe(true);
    });

    it('should return true when both time fields are updated', () => {
      const updateDto: UpdateAppointmentDto = {
        tanggal_janji: '2024-11-25',
        jam_janji: '14:00:00',
      };

      const result = service.isTimeUpdated(updateDto);

      expect(result).toBe(true);
    });

    it('should return false when neither time field is updated', () => {
      const updateDto: UpdateAppointmentDto = {
        status: AppointmentStatus.SELESAI,
        keluhan: 'Updated complaint',
      };

      const result = service.isTimeUpdated(updateDto);

      expect(result).toBe(false);
    });

    it('should return false when updateDto is empty', () => {
      const updateDto: UpdateAppointmentDto = {};

      const result = service.isTimeUpdated(updateDto);

      expect(result).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete appointment lifecycle', () => {
      // Create
      const createDto: CreateAppointmentDto = {
        patient_id: 10,
        doctor_id: 20,
        tanggal_janji: '2024-11-20',
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
      };

      const appointment = service.createAppointmentEntity(
        createDto,
        mockPatient,
        mockDoctor,
        new Date('2024-11-20'),
      ) as Appointment;

      expect(appointment.status).toBe(AppointmentStatus.DIJADWALKAN);

      // Update
      const updateDto: UpdateAppointmentDto = {
        jam_janji: '11:00:00',
      };

      const updated = service.updateAppointmentEntity(
        appointment as Appointment,
        updateDto,
      );

      expect(updated.jam_janji).toBe('11:00:00');

      // Complete
      const completed = service.completeAppointment(updated);

      expect(completed.status).toBe(AppointmentStatus.SELESAI);
    });

    it('should handle appointment cancellation flow', () => {
      const createDto: CreateAppointmentDto = {
        patient_id: 10,
        doctor_id: 20,
        tanggal_janji: '2024-11-20',
        jam_janji: '10:00:00',
        keluhan: 'Sakit kepala',
      };

      const appointment = service.createAppointmentEntity(
        createDto,
        mockPatient,
        mockDoctor,
        new Date('2024-11-20'),
      ) as Appointment;

      const cancelled = service.cancelAppointment(appointment as Appointment);

      expect(cancelled.status).toBe(AppointmentStatus.DIBATALKAN);
    });
  });
});
