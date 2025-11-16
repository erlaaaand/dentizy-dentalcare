import { Roles, ROLES_KEY } from '../roles.decorator';
import { UserRole } from '../../../../roles/entities/role.entity';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Roles).toBeDefined();
  });

  it('should have ROLES_KEY constant', () => {
    expect(ROLES_KEY).toBe('roles');
  });

  it('should call SetMetadata with single role', () => {
    Roles(UserRole.STAF);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [UserRole.STAF]);
  });

  it('should call SetMetadata with multiple roles', () => {
    Roles(UserRole.STAF, UserRole.DOKTER);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [
      UserRole.STAF,
      UserRole.DOKTER,
    ]);
  });

  it('should call SetMetadata with all roles', () => {
    Roles(UserRole.STAF, UserRole.DOKTER, UserRole.STAF);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [
      UserRole.STAF,
      UserRole.DOKTER,
      UserRole.STAF,
    ]);
  });

  it('should handle empty roles', () => {
    Roles();

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, []);
  });

  it('should set metadata key to roles', () => {
    Roles(UserRole.STAF);

    expect(SetMetadata).toHaveBeenCalledWith('roles', expect.any(Array));
  });

  it('should pass roles as array', () => {
    Roles(UserRole.STAF);

    expect(SetMetadata).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([UserRole.STAF]),
    );
  });
});