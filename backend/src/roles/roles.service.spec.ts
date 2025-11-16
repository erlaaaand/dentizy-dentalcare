import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repo: jest.Mocked<any>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repo = module.get(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --------------------------
  // create()
  // --------------------------
  describe('create()', () => {
    it('should create and save a role', async () => {
      const dto = { name: 'staf', description: 'Staff role' } as any;

      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(result).toEqual({ id: 1, ...dto });
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dto);
    });
  });

  // --------------------------
  // findAll()
  // --------------------------
  describe('findAll()', () => {
    it('should return all roles', async () => {
      const roles = [
        { id: 1, name: 'dokter' },
        { id: 2, name: 'staf' },
      ];

      repo.find.mockResolvedValue(roles);

      const result = await service.findAll();
      expect(result).toEqual(roles);
    });
  });

  // --------------------------
  // findOne()
  // --------------------------
  describe('findOne()', () => {
    it('should return a role by ID', async () => {
      const role = { id: 1, name: 'dokter' };
      repo.findOneBy.mockResolvedValue(role);

      const result = await service.findOne(1);
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(100)).rejects.toThrow(NotFoundException);
    });
  });

  // --------------------------
  // update()
  // --------------------------
  describe('update()', () => {
    it('should update and save the role', async () => {
      const existing = { id: 1, name: 'dokter' };
      const dto = { name: 'updated' };

      repo.findOneBy.mockResolvedValue(existing);
      repo.save.mockResolvedValue({ id: 1, ...dto });

      const result = await service.update(1, dto);

      expect(result).toEqual({ id: 1, ...dto });
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw if role does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.update(999, { name: 'updated' })).rejects.toThrow(NotFoundException);
    });
  });

  // --------------------------
  // remove()
  // --------------------------
  describe('remove()', () => {
    it('should remove a role', async () => {
      const existing = { id: 1, name: 'staf' };

      repo.findOneBy.mockResolvedValue(existing);
      repo.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(existing);
    });

    it('should throw if role does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
