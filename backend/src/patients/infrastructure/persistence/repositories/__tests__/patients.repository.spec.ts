// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { PatientRepository } from '../../../../infrastructure/persistence/repositories/patients.repository';
import { Patient } from '../../../../domains/entities/patient.entity';
import { SearchPatientDto } from '../../../../application/dto/search-patient.dto';

// 2. MOCK DATA
const mockPatient = {
  id: 1,
  nama_lengkap: 'Budi Santoso',
  nomor_rekam_medis: 'RM-001',
  nik: '1234567890123456',
  created_at: new Date(),
  is_active: true,
} as Patient;

const mockPatientList = [mockPatient];
const mockCount = 1;

// Mock Query Builder (Chainable)
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  innerJoinAndSelect: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  cache: jest.fn().mockReturnThis(),
  distinct: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(mockPatient),
  getMany: jest.fn().mockResolvedValue(mockPatientList),
  getManyAndCount: jest.fn().mockResolvedValue([mockPatientList, mockCount]),
  getCount: jest.fn().mockResolvedValue(mockCount),
  restore: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue({ affected: 1 }),
};

// 3. TEST SUITE
describe('PatientRepository', () => {
  let repository: PatientRepository;
  let dataSource: DataSource;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    const mockDataSource = {
      createEntityManager: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientRepository,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    repository = module.get<PatientRepository>(PatientRepository);
    dataSource = module.get<DataSource>(DataSource);

    // Mocking repository methods inherited from TypeORM Repository class
    // We need to spy/mock these because 'super()' calls them or we use 'this.findOne'
    jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockPatient);
    jest.spyOn(repository, 'count').mockResolvedValue(100);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS

  describe('createSearchQuery', () => {
    it('should build query builder with basic selection', () => {
      const dto: SearchPatientDto = { is_active: true };
      
      const qb = repository.createSearchQuery(dto);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('patient');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(expect.arrayContaining(['patient.id', 'patient.nama_lengkap']));
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('patient.is_active = :is_active', { is_active: true });
      expect(qb).toBe(mockQueryBuilder);
    });

    it('should not filter active status if is_active is strictly false (meaning show all or specific logic)', () => {
      // Note: Logic in code: if (dto.is_active !== false) -> apply filter.
      // So if dto.is_active === false, it skips the default "active only" filter?
      // Let's assume that based on your code snippet.
      const dto: SearchPatientDto = { is_active: false };
      repository.createSearchQuery(dto);
      
      // Should NOT call andWhere with is_active=true
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled(); 
    });
  });

  describe('findByMedicalRecordNumber', () => {
    it('should find patient with caching', async () => {
      const mrn = 'RM-001';
      const result = await repository.findByMedicalRecordNumber(mrn);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('patient.nomor_rekam_medis = :number', { number: mrn });
      expect(mockQueryBuilder.cache).toHaveBeenCalledWith(`patient_mrn_${mrn}`, 60000);
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockPatient);
    });
  });

  describe('findByNik', () => {
    it('should find patient by NIK with caching', async () => {
      const nik = '1234567890';
      const result = await repository.findByNik(nik);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('patient.nik = :nik', { nik });
      expect(mockQueryBuilder.cache).toHaveBeenCalledWith(`patient_nik_${nik}`, 60000);
      expect(result).toEqual(mockPatient);
    });
  });

  describe('findWithUpcomingAppointments', () => {
    it('should find patients with scheduled appointments in range', async () => {
      const days = 3;
      await repository.findWithUpcomingAppointments(days);

      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('patient.appointments', 'appointment');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('BETWEEN :now AND :future'),
        expect.any(Object)
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('appointment.status = :status', { status: 'dijadwalkan' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('appointment.tanggal', 'ASC');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('findByDoctorId', () => {
    it('should paginate patients by doctor', async () => {
      const doctorId = 5;
      const page = 2;
      const limit = 5;

      await repository.findByDoctorId(doctorId, page, limit);

      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('patient.appointments', 'appointment');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('appointment.doctor_id = :doctorId', { doctorId });
      expect(mockQueryBuilder.distinct).toHaveBeenCalledWith(true);
      
      // Pagination Check: Page 2, Limit 5 -> Skip 5
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should aggregate counts for total, new, and active patients', async () => {
      // Arrange
      // Promise.all([count(), count(new), count(active)])
      // We need to mock 'count' implementation to return different values based on args?
      // Or simpler: just verify it's called 3 times.
      
      // Mock return values for Promise.all calls
      (repository.count as jest.Mock)
        .mockResolvedValueOnce(100)  // Total
        .mockResolvedValueOnce(10)   // New
        .mockResolvedValueOnce(80);  // Active

      // Act
      const stats = await repository.getStatistics();

      // Assert
      expect(repository.count).toHaveBeenCalledTimes(3);
      expect(stats).toEqual({
        total: 100,
        new_this_month: 10,
        active: 80,
      });
    });
  });

  describe('findSoftDeletedById', () => {
    it('should find patient including soft deleted records', async () => {
      await repository.findSoftDeletedById(1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true, // Critical check
      });
    });
  });

  describe('restoreById', () => {
    it('should execute restore query', async () => {
      await repository.restoreById(1);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.restore).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id = :id', { id: 1 });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('existsByField', () => {
    it('should return true if count > 0', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(1);
      const exists = await repository.existsByField('email', 'test@test.com');
      expect(exists).toBe(true);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('patient.email = :value', { value: 'test@test.com' });
    });

    it('should return false if count is 0', async () => {
      mockQueryBuilder.getCount.mockResolvedValue(0);
      const exists = await repository.existsByField('nik', '123');
      expect(exists).toBe(false);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should execute bulk update query', async () => {
      const ids = [1, 2, 3];
      await repository.bulkUpdateStatus(ids, false);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Patient);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ is_active: false });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id IN (:...ids)', { ids });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});