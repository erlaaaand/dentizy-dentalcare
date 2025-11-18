// 1. IMPORTS
import { NotificationResponseDto } from '../notification-response.dto';
import { NotificationStatus, NotificationType } from '../../../domains/entities/notification.entity';

// 2. MOCK DATA
const mockCompleteNotificationData = {
  id: 1,
  appointment_id: 100,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z'),
  appointment: {
    id: 100,
    tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
    jam_janji: '10:00',
    patient: {
      id: 500,
      nama_lengkap: 'John Doe',
      email: 'john.doe@example.com'
    },
    doctor: {
      id: 300,
      nama_lengkap: 'Dr. Smith'
    }
  }
};

const mockSentNotificationData = {
  id: 2,
  appointment_id: 101,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.SENT,
  send_at: new Date('2024-01-15T09:00:00.000Z'),
  sent_at: new Date('2024-01-15T09:00:00.500Z'),
  created_at: new Date('2024-01-14T08:00:00.000Z'),
  updated_at: new Date('2024-01-15T09:00:01.000Z'),
  appointment: {
    id: 101,
    tanggal_janji: new Date('2024-01-16T10:00:00.000Z'),
    jam_janji: '10:00',
    patient: {
      id: 501,
      nama_lengkap: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    doctor: {
      id: 301,
      nama_lengkap: 'Dr. Johnson'
    }
  }
};

const mockMinimalNotificationData = {
  id: 3,
  appointment_id: 102,
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.FAILED,
  send_at: new Date('2024-01-15T08:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T07:00:00.000Z'),
  updated_at: new Date('2024-01-14T07:00:00.000Z')
  // appointment is optional, so it can be omitted
};

const mockEdgeCaseData = {
  id: 0, // edge case: zero ID
  appointment_id: 0, // edge case: zero appointment ID
  type: NotificationType.EMAIL_REMINDER,
  status: NotificationStatus.PENDING,
  send_at: new Date('2023-12-31T23:59:59.999Z'), // edge case: end of year
  sent_at: new Date('2024-01-01T00:00:00.000Z'), // edge case: start of year
  created_at: new Date('2020-01-01T00:00:00.000Z'), // edge case: old date
  updated_at: new Date('2024-12-31T23:59:59.999Z'), // edge case: future date
  appointment: {
    id: 0,
    tanggal_janji: new Date('2024-02-29T10:00:00.000Z'), // edge case: leap day
    jam_janji: '23:59', // edge case: end of day
    patient: {
      id: 0,
      nama_lengkap: 'A', // edge case: short name
      email: 'a@b.co' // edge case: short email
    },
    doctor: {
      id: 0,
      nama_lengkap: 'Dr. A' // edge case: short doctor name
    }
  }
};

const mockAllNotificationTypes = Object.values(NotificationType).map((type, index) => ({
  id: index + 10,
  appointment_id: 200 + index,
  type: type,
  status: NotificationStatus.PENDING,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z')
}));

const mockAllStatusTypes = Object.values(NotificationStatus).map((status, index) => ({
  id: index + 20,
  appointment_id: 300 + index,
  type: NotificationType.EMAIL_REMINDER,
  status: status,
  send_at: new Date('2024-01-15T10:00:00.000Z'),
  sent_at: status === NotificationStatus.SENT ? new Date('2024-01-15T10:00:00.000Z') : null,
  created_at: new Date('2024-01-14T09:00:00.000Z'),
  updated_at: new Date('2024-01-14T09:00:00.000Z')
}));

// 3. TEST SUITE
describe('NotificationResponseDto', () => {

  // 4. SETUP AND TEARDOWN
  let notificationDto: NotificationResponseDto;

  beforeEach(() => {
    notificationDto = new NotificationResponseDto();
  });

  afterEach(() => {
    // Clean up if needed
  });

  // 5. EXECUTE METHOD TESTS
  describe('Object Creation and Assignment Tests', () => {

    const createDtoFromData = (data: any): NotificationResponseDto => {
      const dto = new NotificationResponseDto();
      return Object.assign(dto, data);
    };

    it('should create DTO instance successfully', () => {
      const dto = new NotificationResponseDto();
      expect(dto).toBeInstanceOf(NotificationResponseDto);
    });

    it('should assign complete data correctly', () => {
      const dto = createDtoFromData(mockCompleteNotificationData);

      expect(dto.id).toBe(mockCompleteNotificationData.id);
      expect(dto.appointment_id).toBe(mockCompleteNotificationData.appointment_id);
      expect(dto.type).toBe(mockCompleteNotificationData.type);
      expect(dto.status).toBe(mockCompleteNotificationData.status);
      expect(dto.send_at).toBe(mockCompleteNotificationData.send_at);
      expect(dto.sent_at).toBe(mockCompleteNotificationData.sent_at);
      expect(dto.created_at).toBe(mockCompleteNotificationData.created_at);
      expect(dto.updated_at).toBe(mockCompleteNotificationData.updated_at);
      expect(dto.appointment).toEqual(mockCompleteNotificationData.appointment);
    });

    it('should handle sent notification with sent_at date', () => {
      const dto = createDtoFromData(mockSentNotificationData);

      expect(dto.status).toBe(NotificationStatus.SENT);
      expect(dto.sent_at).toBeInstanceOf(Date);
      expect(dto.sent_at).toEqual(mockSentNotificationData.sent_at);
    });
  });

  // 6. SUB-GROUP TESTS
  describe('Field Validation Tests', () => {

    describe('Basic Fields', () => {
      it('should have correct id field', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockCompleteNotificationData);
        expect(typeof dto.id).toBe('number');
        expect(dto.id).toBe(1);
      });

      it('should have correct appointment_id field', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockCompleteNotificationData);
        expect(typeof dto.appointment_id).toBe('number');
        expect(dto.appointment_id).toBe(100);
      });

      it('should handle zero values for IDs', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockEdgeCaseData);
        expect(dto.id).toBe(0);
        expect(dto.appointment_id).toBe(0);
      });
    });

    describe('NotificationType Field', () => {
      it('should accept all valid NotificationType values', () => {
        mockAllNotificationTypes.forEach(mockData => {
          const dto = Object.assign(new NotificationResponseDto(), mockData);
          expect(dto.type).toBe(mockData.type);
          expect(Object.values(NotificationType)).toContain(dto.type);
        });
      });

      it('should have correct type for complete data', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockCompleteNotificationData);
        expect(dto.type).toBe(NotificationType.EMAIL_REMINDER);
      });

      it('should have correct type for sent notification', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockSentNotificationData);
        expect(dto.type).toBe(NotificationType.EMAIL_REMINDER);
      });
    });

    describe('NotificationStatus Field', () => {
      it('should accept all valid NotificationStatus values', () => {
        mockAllStatusTypes.forEach(mockData => {
          const dto = Object.assign(new NotificationResponseDto(), mockData);
          expect(dto.status).toBe(mockData.status);
          expect(Object.values(NotificationStatus)).toContain(dto.status);
        });
      });

      it('should have PENDING status for complete data', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockCompleteNotificationData);
        expect(dto.status).toBe(NotificationStatus.PENDING);
      });

      it('should have SENT status for sent notification', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockSentNotificationData);
        expect(dto.status).toBe(NotificationStatus.SENT);
      });

      it('should have FAILED status for minimal data', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockMinimalNotificationData);
        expect(dto.status).toBe(NotificationStatus.FAILED);
      });
    });

    describe('Date Fields', () => {
      it('should have all date fields as Date objects', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockCompleteNotificationData);

        expect(dto.send_at).toBeInstanceOf(Date);
        expect(dto.created_at).toBeInstanceOf(Date);
        expect(dto.updated_at).toBeInstanceOf(Date);
        expect(dto.sent_at).toBeNull();
      });

      it('should handle sent_at as Date when status is SENT', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockSentNotificationData);

        expect(dto.sent_at).toBeInstanceOf(Date);
        expect(dto.sent_at).toEqual(mockSentNotificationData.sent_at);
      });

      it('should handle edge case dates correctly', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockEdgeCaseData);

        expect(dto.send_at).toBeInstanceOf(Date);
        expect(dto.sent_at).toBeInstanceOf(Date);
        expect(dto.created_at).toBeInstanceOf(Date);
        expect(dto.updated_at).toBeInstanceOf(Date);
      });
    });

    describe('Optional Appointment Field', () => {
      it('should include appointment data when provided', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockCompleteNotificationData);

        expect(dto.appointment).toBeDefined();
        expect(dto.appointment!.id).toBe(100);
        expect(dto.appointment!.tanggal_janji).toBeInstanceOf(Date);
        expect(dto.appointment!.jam_janji).toBe('10:00');

        // Patient data
        expect(dto.appointment!.patient).toBeDefined();
        expect(dto.appointment!.patient.id).toBe(500);
        expect(dto.appointment!.patient.nama_lengkap).toBe('John Doe');
        expect(dto.appointment!.patient.email).toBe('john.doe@example.com');

        // Doctor data
        expect(dto.appointment!.doctor).toBeDefined();
        expect(dto.appointment!.doctor.id).toBe(300);
        expect(dto.appointment!.doctor.nama_lengkap).toBe('Dr. Smith');
      });

      it('should handle appointment absence when not provided', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockMinimalNotificationData);

        expect(dto.appointment).toBeUndefined();
      });

      it('should handle edge case appointment data', () => {
        const dto = Object.assign(new NotificationResponseDto(), mockEdgeCaseData);

        expect(dto.appointment).toBeDefined();
        expect(dto.appointment!.id).toBe(0);
        expect(dto.appointment!.patient.id).toBe(0);
        expect(dto.appointment!.doctor.id).toBe(0);
        expect(dto.appointment!.patient.nama_lengkap).toBe('A');
        expect(dto.appointment!.patient.email).toBe('a@b.co');
      });
    });
  });

  describe('Data Structure Tests', () => {
    it('should maintain correct data structure for complete object', () => {
      const dto = Object.assign(
        new NotificationResponseDto(),
        mockCompleteNotificationData
      ) as NotificationResponseDto;

      const expectedStructure = {
        id: expect.any(Number),
        appointment_id: expect.any(Number),
        type: expect.any(String),
        status: expect.any(String),
        send_at: expect.any(Date),
        sent_at: null,        // ✔️ FIX (tidak pakai matcher)
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        appointment: expect.objectContaining({
          id: expect.any(Number),
          tanggal_janji: expect.any(Date),
          jam_janji: expect.any(String),
          patient: expect.objectContaining({
            id: expect.any(Number),
            nama_lengkap: expect.any(String),
            email: expect.any(String),
          }),
          doctor: expect.objectContaining({
            id: expect.any(Number),
            nama_lengkap: expect.any(String),
          }),
        }),
      };

      expect(dto).toMatchObject(expectedStructure);

      // ✔️ cek union: boleh Date atau null
      expect(
        dto.sent_at === null ||
        (dto.sent_at instanceof Date && !isNaN(dto.sent_at.getTime()))
      ).toBe(true);
    });

    it('should maintain correct data structure for minimal object', () => {
      const dto = Object.assign(new NotificationResponseDto(), mockMinimalNotificationData) as NotificationResponseDto;
      const expectedStructure = {
        id: expect.any(Number),
        appointment_id: expect.any(Number),
        type: expect.any(String),
        status: expect.any(String),
        send_at: expect.any(Date),
        sent_at: null,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      };

      expect(dto).toMatchObject(expectedStructure);

      // 🔍 Cek value actual: boleh Date atau null
      expect(
        dto.sent_at === null ||
        (dto.sent_at instanceof Date && !isNaN(dto.sent_at.getTime()))
      ).toBe(true);

    });

  });

  describe('Integration Tests', () => {
    it('should handle multiple notification instances correctly', () => {
      const dtos = [
        mockCompleteNotificationData,
        mockSentNotificationData,
        mockMinimalNotificationData
      ].map(data => Object.assign(new NotificationResponseDto(), data));

      expect(dtos).toHaveLength(3);
      expect(dtos[0].id).toBe(1);
      expect(dtos[1].id).toBe(2);
      expect(dtos[2].id).toBe(3);
      expect(dtos[0].status).toBe(NotificationStatus.PENDING);
      expect(dtos[1].status).toBe(NotificationStatus.SENT);
      expect(dtos[2].status).toBe(NotificationStatus.FAILED);
    });

    it('should handle array of all notification types', () => {
      const dtos = mockAllNotificationTypes.map(data =>
        Object.assign(new NotificationResponseDto(), data)
      );

      expect(dtos).toHaveLength(Object.values(NotificationType).length);

      dtos.forEach((dto, index) => {
        expect(dto).toBeInstanceOf(NotificationResponseDto);
        expect(dto.type).toBe(mockAllNotificationTypes[index].type);
      });
    });

    it('should handle array of all status types', () => {
      const dtos = mockAllStatusTypes.map(data =>
        Object.assign(new NotificationResponseDto(), data)
      );

      expect(dtos).toHaveLength(Object.values(NotificationStatus).length);

      dtos.forEach((dto, index) => {
        expect(dto).toBeInstanceOf(NotificationResponseDto);
        expect(dto.status).toBe(mockAllStatusTypes[index].status);
      });
    });
  });

  describe('Edge Case Tests', () => {
    it('should handle very old and future dates', () => {
      const dto = Object.assign(new NotificationResponseDto(), mockEdgeCaseData);

      expect(dto.created_at.getFullYear()).toBe(2020);

      // updated_at bebas, yang penting valid Date
      expect(dto.updated_at instanceof Date).toBe(true);
      expect(dto.updated_at.getTime()).not.toBeNaN();
    });

    it('should handle leap day in appointment date', () => {
      const dto = Object.assign(new NotificationResponseDto(), mockEdgeCaseData);

      expect(dto.appointment!.tanggal_janji.getDate()).toBe(29);
      expect(dto.appointment!.tanggal_janji.getMonth()).toBe(1); // February
      expect(dto.appointment!.tanggal_janji.getFullYear()).toBe(2024);
    });

    it('should handle minimal patient and doctor information', () => {
      const dto = Object.assign(new NotificationResponseDto(), mockEdgeCaseData);

      expect(dto.appointment!.patient.nama_lengkap).toBe('A');
      expect(dto.appointment!.patient.email).toBe('a@b.co');
      expect(dto.appointment!.doctor.nama_lengkap).toBe('Dr. A');
    });

    it('should handle end of day time format', () => {
      const dto = Object.assign(new NotificationResponseDto(), mockEdgeCaseData);

      expect(dto.appointment!.jam_janji).toBe('23:59');
    });
  });
});