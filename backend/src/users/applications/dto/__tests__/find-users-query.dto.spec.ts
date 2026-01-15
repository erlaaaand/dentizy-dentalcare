// __tests__/applications/dto/find-users-query.dto.spec.ts

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindUsersQueryDto } from '../../../applications/dto/find-users-query.dto';
import { UserRole } from '../../../../roles/entities/role.entity';

const validateDto = async (raw: Record<string, any>) => {
  const dto = plainToInstance(FindUsersQueryDto, raw, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = await validate(dto, {
    whitelist: true,
    forbidUnknownValues: false,
  });

  return { dto, errors };
};

const validQueryRaw = {
  role: UserRole.DOKTER,
  page: '2',
  limit: '20',
  search: ' Budi ',
  isActive: 'true',
};

describe('FindUsersQueryDto', () => {
  it('should validate empty object with defaults', async () => {
    const { dto, errors } = await validateDto({});

    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should transform and validate full valid query params', async () => {
    const { dto, errors } = await validateDto(validQueryRaw);

    expect(errors.length).toBe(0);

    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
    expect(dto.isActive).toBe(true);
    expect(dto.search).toBe('Budi');
  });

  describe('role', () => {
    it('should accept valid enum', async () => {
      const { errors } = await validateDto({ role: UserRole.STAF });
      expect(errors.length).toBe(0);
    });

    it('should fail invalid role', async () => {
      const { errors } = await validateDto({ role: 'INVALID_ROLE' });

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });
  });

  describe('pagination', () => {
    it('should fail if page < 1', async () => {
      const { errors } = await validateDto({ page: 0 });

      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail if limit > 100', async () => {
      const { errors } = await validateDto({ limit: 150 });

      expect(errors[0].property).toBe('limit');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail if page is non-number text', async () => {
      const { errors } = await validateDto({ page: 'hello' });

      expect(errors[0].property).toBe('page');
      expect(errors[0].constraints).toHaveProperty('isNumber');
    });
  });

  describe('isActive', () => {
    it('should transform "false" to boolean false', async () => {
      const { dto, errors } = await validateDto({ isActive: 'false' });

      expect(errors.length).toBe(0);
      expect(dto.isActive).toBe(false);
    });

    it('should fail random text', async () => {
      const { errors } = await validateDto({ isActive: 'random' });

      expect(errors[0].property).toBe('isActive');
      expect(errors[0].constraints).toHaveProperty('isBoolean');
    });
  });
});
