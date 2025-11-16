import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../roles.controller';
import { RolesService } from '../roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { User } from 'src/users/domains/entities/user.entity';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a role', async () => {
      const dto = { name: 'ADMIN', description: 'Administrator role' } as unknown as CreateRoleDto;
      mockRolesService.create.mockResolvedValue(dto);

      const result = await controller.create(dto);
      expect(result).toEqual(dto);
      expect(mockRolesService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should return array of roles', async () => {
      const roles = [{ id: 1, name: 'ADMIN' }];
      mockRolesService.findAll.mockResolvedValue(roles);

      expect(await controller.findAll()).toEqual(roles);
    });
  });

  describe('findOne()', () => {
    it('should return a role by id', async () => {
      const role = { id: 1, name: 'ADMIN' };
      mockRolesService.findOne.mockResolvedValue(role);

      expect(await controller.findOne(1)).toEqual(role);
    });
  });

  describe('update()', () => {
    it('should update a role', async () => {
      const dto: UpdateRoleDto = { name: 'UPDATED' };
      const updated = { id: 1, ...dto };
      mockRolesService.update.mockResolvedValue(updated);

      expect(await controller.update(1, dto)).toEqual(updated);
    });
  });

  describe('remove()', () => {
    it('should remove a role', async () => {
      mockRolesService.remove.mockResolvedValue({ deleted: true });

      expect(await controller.remove(1)).toEqual({ deleted: true });
    });
  });
});
