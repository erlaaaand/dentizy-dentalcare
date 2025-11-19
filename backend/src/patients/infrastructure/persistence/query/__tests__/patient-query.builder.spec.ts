// 1. IMPORTS
import { Test, TestingModule } from '@nestjs/testing';
import { SelectQueryBuilder, Brackets } from 'typeorm';
import { PatientQueryBuilder } from '../../../../infrastructure/persistence/query/patient-query.builder'; // Sesuaikan path
import { SearchPatientDto, SortField, SortOrder } from '../../../../application/dto/search-patient.dto';
import { Patient } from '../../../../domains/entities/patient.entity';

// 2. MOCK DATA
const mockSearchQuery: SearchPatientDto = {
  search: 'Budi',
  page: 1,
  limit: 10,
};

const mockFullQuery: SearchPatientDto = {
  search: 'Santoso',
  jenis_kelamin: 'L' as any,
  umur_min: 20,
  umur_max: 30,
  tanggal_daftar_dari: '2023-01-01',
  tanggal_daftar_sampai: '2023-12-31',
  doctor_id: 5,
  is_active: true,
  is_new: true,
  sortBy: SortField.UMUR,
  sortOrder: SortOrder.ASC,
};

// 3. TEST SUITE
describe('PatientQueryBuilder', () => {
  let builder: PatientQueryBuilder;
  let mockQb: any;

  // 4. SETUP AND TEARDOWN
  beforeEach(async () => {
    // Mock SelectQueryBuilder dengan method chaining
    mockQb = {
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      // Method lain yang mungkin dipanggil
      setQueryRunner: jest.fn().mockReturnThis(),
      setUseIndexHints: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PatientQueryBuilder],
    }).compile();

    builder = module.get<PatientQueryBuilder>(PatientQueryBuilder);
  });

  it('should be defined', () => {
    expect(builder).toBeDefined();
  });

  // 5. EXECUTE METHOD TESTS (Main build flow)

  describe('build', () => {
    it('should return the query builder instance', () => {
      const result = builder.build(mockQb, {});
      expect(result).toBe(mockQb);
    });

    it('should apply default sorting if no params provided', () => {
      builder.build(mockQb, {});
      
      // Default: Created At DESC
      expect(mockQb.orderBy).toHaveBeenCalledWith('patient.created_at', 'DESC');
      // Secondary sort: ID DESC
      expect(mockQb.addOrderBy).toHaveBeenCalledWith('patient.id', 'DESC');
    });
  });

  // 6. SUB-GROUP TESTS (Specific Filters)

  describe('Search Filter', () => {
    it('should apply Brackets for search if term is >= 2 chars', () => {
      builder.build(mockQb, { search: 'Budi' });

      // Memastikan andWhere dipanggil dengan instance Brackets
      expect(mockQb.andWhere).toHaveBeenCalledWith(expect.any(Brackets));
    });

    it('should NOT apply search filter if term is < 2 chars', () => {
      builder.build(mockQb, { search: 'A' }); // Too short

      expect(mockQb.andWhere).not.toHaveBeenCalledWith(expect.any(Brackets));
    });

    it('should trim search term', () => {
      // Kita tidak bisa dengan mudah inspect isi Brackets callback di unit test tanpa mock Brackets,
      // tapi kita bisa memastikan method dipanggil.
      builder.build(mockQb, { search: '  Spasi  ' });
      expect(mockQb.andWhere).toHaveBeenCalled();
    });
  });

  describe('Age Filter', () => {
    it('should convert maxAge to birthDate range (>=)', () => {
      // Max Age 30 -> Lahir >= (Tahun Ini - 30)
      builder.build(mockQb, { umur_max: 30 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'patient.tanggal_lahir >= :maxBirthDate',
        expect.objectContaining({ maxBirthDate: expect.any(String) })
      );
    });

    it('should convert minAge to birthDate range (<=)', () => {
      // Min Age 20 -> Lahir <= (Tahun Ini - 20)
      builder.build(mockQb, { umur_min: 20 });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'patient.tanggal_lahir <= :minBirthDate',
        expect.objectContaining({ minBirthDate: expect.any(String) })
      );
    });
  });

  describe('Doctor Filter', () => {
    it('should join appointments table when doctor_id is provided', () => {
      builder.build(mockQb, { doctor_id: 99 });

      expect(mockQb.leftJoin).toHaveBeenCalledWith('patient.appointments', 'appointment');
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'appointment.doctor_id = :doctor_id', 
        { doctor_id: 99 }
      );
      expect(mockQb.distinct).toHaveBeenCalledWith(true);
    });
  });

  describe('Status Filters', () => {
    it('should filter by is_active boolean', () => {
      builder.build(mockQb, { is_active: true });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'patient.is_active = :is_active', 
        { is_active: true }
      );
    });

    it('should filter by is_new (created last 30 days)', () => {
      builder.build(mockQb, { is_new: true });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'patient.created_at >= :thirtyDaysAgo',
        expect.any(Object)
      );
    });
  });

  describe('Date Range Filter', () => {
    it('should filter by start and end date', () => {
      const from = '2023-01-01';
      const to = '2023-01-31';
      builder.build(mockQb, { tanggal_daftar_dari: from, tanggal_daftar_sampai: to });

      expect(mockQb.andWhere).toHaveBeenCalledWith('DATE(patient.created_at) >= :dateFrom', { dateFrom: from });
      expect(mockQb.andWhere).toHaveBeenCalledWith('DATE(patient.created_at) <= :dateTo', { dateTo: to });
    });
  });

  describe('Sorting Logic', () => {
    it('should handle generic field sorting', () => {
      builder.build(mockQb, { sortBy: SortField.NAMA_LENGKAP, sortOrder: SortOrder.ASC });
      expect(mockQb.orderBy).toHaveBeenCalledWith('patient.nama_lengkap', 'ASC');
    });

    it('should handle special sorting for UMUR (Age)', () => {
      // Sorting by Age ASC means Sorting by BirthDate DESC
      builder.build(mockQb, { sortBy: SortField.UMUR, sortOrder: SortOrder.ASC });
      
      expect(mockQb.orderBy).toHaveBeenCalledWith('patient.tanggal_lahir', 'DESC');
    });

    it('should handle special sorting for UMUR (Age) DESC', () => {
      // Sorting by Age DESC means Sorting by BirthDate ASC
      builder.build(mockQb, { sortBy: SortField.UMUR, sortOrder: SortOrder.DESC });
      
      expect(mockQb.orderBy).toHaveBeenCalledWith('patient.tanggal_lahir', 'ASC');
    });
  });

  describe('Helper: addEagerRelations', () => {
    it('should add relations', () => {
        // Mock return value untuk leftJoinAndSelect yang hanya ada di method helper ini
        mockQb.leftJoinAndSelect = jest.fn().mockReturnThis();
        
        builder.addEagerRelations(mockQb);

        expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('patient.appointments', 'appointment');
        expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('patient.medical_records', 'medical_record');
    });
  });
});