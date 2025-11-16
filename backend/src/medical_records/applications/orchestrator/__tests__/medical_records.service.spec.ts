import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsService } from '../medical_records.service';
import { MedicalRecordMapper } from '../../../domains/mappers/medical-record.mappers';
import { MedicalRecordCreationService } from '../../use-cases/medical-record-creation.service';
import { MedicalRecordUpdateService } from '../../use-cases/medical-record-update.service';
import { MedicalRecordFindService } from '../../use-cases/medical-record-find.service';
import { MedicalRecordSearchService } from '../../use-cases/medical-record-search.service';
import { MedicalRecordAppointmentFinderService } from '../../use-cases/medical-record-appointment-finder.service';
import { MedicalRecordDeletionService } from '../../use-cases/medical-record-deletion.service';
import { MedicalRecordQueryBuilder } from '../../../infrastructure/persistence/query/medical-record-query.builder';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;

  const mockMapper = {
    toResponseDto: jest.fn(),
    toResponseDtoArray: jest.fn(),
  };

  const mockCreation = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockFind = { execute: jest.fn() };
  const mockSearch = { execute: jest.fn() };
  const mockAppointmentFinder = {
    execute: jest.fn(),
    exists: jest.fn(),
  };
  const mockDeletion = {
    execute: jest.fn(),
    hardDelete: jest.fn(),
    restore: jest.fn(),
  };
  const mockQueryBuilder = {
    buildFindAllQuery: jest.fn(),
  };

  const mockUser = {
    id: 1,
    roles: [],
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        { provide: MedicalRecordMapper, useValue: mockMapper },
        { provide: MedicalRecordCreationService, useValue: mockCreation },
        { provide: MedicalRecordUpdateService, useValue: mockUpdate },
        { provide: MedicalRecordFindService, useValue: mockFind },
        { provide: MedicalRecordSearchService, useValue: mockSearch },
        { provide: MedicalRecordAppointmentFinderService, useValue: mockAppointmentFinder },
        { provide: MedicalRecordDeletionService, useValue: mockDeletion },
        { provide: MedicalRecordQueryBuilder, useValue: mockQueryBuilder },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * CREATE
   */
  it('should create medical record', async () => {
    const dto = { field: 'value' } as any;

    mockCreation.execute.mockResolvedValue({ id: 1 });
    mockMapper.toResponseDto.mockReturnValue({ id: 1 });

    const result = await service.create(dto, mockUser);

    expect(mockCreation.execute).toHaveBeenCalledWith(dto, mockUser);
    expect(mockMapper.toResponseDto).toHaveBeenCalled();
    expect(result).toEqual({ id: 1 });
  });

  /**
   * FIND ALL
   */
  it('should return paginated records for findAll', async () => {
    const query = { page: 1, limit: 10 };

    const qbMock = {
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 }], 1]),
    };

    mockQueryBuilder.buildFindAllQuery.mockReturnValue(qbMock);
    mockMapper.toResponseDtoArray.mockReturnValue([{ id: 1 }]);

    const result = await service.findAll(mockUser, query);

    expect(mockQueryBuilder.buildFindAllQuery).toHaveBeenCalledWith(mockUser, query);
    expect(result).toEqual({
      data: [{ id: 1 }],
      total: 1,
      page: 1,
      limit: 10,
    });
  });

  /**
   * SEARCH
   */
  it('should search medical records', async () => {
    const filters: any = { keyword: 'test' };
    const searchResult = {
      data: [{ id: 1 }],
      total: 1,
      page: 1,
      limit: 10,
    };

    mockSearch.execute.mockResolvedValue(searchResult);
    mockMapper.toResponseDtoArray.mockReturnValue(searchResult.data);

    const result = await service.search(filters, mockUser);

    expect(result).toEqual(searchResult);
  });

  /**
   * FIND ONE
   */
  it('should find one medical record', async () => {
    mockFind.execute.mockResolvedValue({ id: 1 });
    mockMapper.toResponseDto.mockReturnValue({ id: 1 });

    const result = await service.findOne(1, mockUser);

    expect(mockFind.execute).toHaveBeenCalledWith(1, mockUser);
    expect(result).toEqual({ id: 1 });
  });

  /**
   * FIND BY APPOINTMENT
   */
  it('should return record by appointment ID', async () => {
    mockAppointmentFinder.execute.mockResolvedValue({ id: 1 });
    mockMapper.toResponseDto.mockReturnValue({ id: 1 });

    const result = await service.findByAppointmentId(1, mockUser);

    expect(result).toEqual({ id: 1 });
  });

  it('should return null if no record for appointment ID', async () => {
    mockAppointmentFinder.execute.mockResolvedValue(null);

    const result = await service.findByAppointmentId(1, mockUser);

    expect(result).toBeNull();
  });

  /**
   * UPDATE
   */
  it('should update medical record', async () => {
    mockUpdate.execute.mockResolvedValue({ id: 1 });
    mockMapper.toResponseDto.mockReturnValue({ id: 1 });

    const result = await service.update(1, {}, mockUser);

    expect(result).toEqual({ id: 1 });
  });

  /**
   * DELETE (soft)
   */
  it('should soft delete medical record', async () => {
    await service.remove(1, mockUser);

    expect(mockDeletion.execute).toHaveBeenCalledWith(1, mockUser);
  });

  /**
   * HARD DELETE
   */
  it('should hard delete medical record', async () => {
    await service.hardDelete(1, mockUser);

    expect(mockDeletion.hardDelete).toHaveBeenCalledWith(1, mockUser);
  });

  /**
   * RESTORE
   */
  it('should restore medical record', async () => {
    mockDeletion.restore.mockResolvedValue({ id: 1 });
    mockMapper.toResponseDto.mockReturnValue({ id: 1 });

    const result = await service.restore(1, mockUser);

    expect(result).toEqual({ id: 1 });
  });

  /**
   * EXISTS
   */
  it('should check if record exists for appointment', async () => {
    mockAppointmentFinder.exists.mockResolvedValue(true);

    const result = await service.existsForAppointment(10);

    expect(result).toBe(true);
  });
});
