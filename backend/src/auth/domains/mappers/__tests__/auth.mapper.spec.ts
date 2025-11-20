// backend/src/auth/domains/mappers/__tests__/auth.mapper.spec.ts
import { AuthMapper } from '../auth.mapper';
import { User } from '../../../../users/domains/entities/user.entity';
import { UserRole } from '../../../../roles/entities/role.entity';

// ======================
// MOCK DATA
// ======================
const mockUser: User = {
  id: 1,
  username: 'testuser',
  nama_lengkap: 'Test User',
  password: '$2b$10$hashedPassword',
  roles: [
    { id: 1, name: UserRole.STAF, description: 'Staf' },
    { id: 2, name: UserRole.DOKTER, description: 'Dokter' },
  ],
} as User;

const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';

// ======================
// TEST SUITE
// ======================
describe('AuthMapper', () => {
  it('should be defined', () => {
    expect(AuthMapper).toBeDefined();
  });

  // ======================
  // toTokenPayload METHOD TESTS
  // ======================
  describe('toTokenPayload', () => {
    it('should map user to token payload correctly', () => {
      const result = AuthMapper.toTokenPayload(mockUser);

      expect(result).toEqual({
        userId: mockUser.id,
        username: mockUser.username,
        roles: ['staf', 'dokter'],
      });
    });

    it('should include userId', () => {
      const result = AuthMapper.toTokenPayload(mockUser);

      expect(result).toHaveProperty('userId', mockUser.id);
    });

    it('should include username', () => {
      const result = AuthMapper.toTokenPayload(mockUser);

      expect(result).toHaveProperty('username', mockUser.username);
    });

    it('should map roles to role names', () => {
      const result = AuthMapper.toTokenPayload(mockUser);

      expect(result.roles).toEqual(['staf', 'dokter']);
    });

    it('should handle user with no roles', () => {
      const userWithNoRoles = { ...mockUser, roles: [] } as User;

      const result = AuthMapper.toTokenPayload(userWithNoRoles);

      expect(result.roles).toEqual([]);
    });

    it('should handle user with undefined roles', () => {
      const userWithUndefinedRoles = { ...mockUser, roles: undefined } as any;

      const result = AuthMapper.toTokenPayload(userWithUndefinedRoles);

      expect(result.roles).toEqual([]);
    });

    it('should handle user with null roles', () => {
      const userWithNullRoles = { ...mockUser, roles: null } as any;

      const result = AuthMapper.toTokenPayload(userWithNullRoles);

      expect(result.roles).toEqual([]);
    });

    it('should handle user with single role', () => {
      const userWithSingleRole = {
        ...mockUser,
        roles: [{ id: 1, name: UserRole.STAF, description: 'Staf' }],
      } as User;

      const result = AuthMapper.toTokenPayload(userWithSingleRole);

      expect(result.roles).toEqual(['staf']);
    });
  });

  // ======================
  // toLoginResponse METHOD TESTS
  // ======================
  describe('toLoginResponse', () => {
    it('should map user and token to login response correctly', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result).toEqual({
        access_token: mockAccessToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          nama_lengkap: mockUser.nama_lengkap,
          roles: ['staf', 'dokter'],
        },
      });
    });

    it('should include access token', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result).toHaveProperty('access_token', mockAccessToken);
    });

    it('should include user object', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result).toHaveProperty('user');
      expect(result.user).toBeDefined();
    });

    it('should include user id', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result.user).toHaveProperty('id', mockUser.id);
    });

    it('should include username', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result.user).toHaveProperty('username', mockUser.username);
    });

    it('should include nama_lengkap', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result.user).toHaveProperty('nama_lengkap', mockUser.nama_lengkap);
    });

    it('should include roles', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result.user).toHaveProperty('roles');
      expect(result.user.roles).toEqual(['staf', 'dokter']);
    });

    it('should not include password', () => {
      const result = AuthMapper.toLoginResponse(mockUser, mockAccessToken);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should handle user with no roles', () => {
      const userWithNoRoles = { ...mockUser, roles: [] } as User;

      const result = AuthMapper.toLoginResponse(userWithNoRoles, mockAccessToken);

      expect(result.user.roles).toEqual([]);
    });

    it('should handle empty token', () => {
      const result = AuthMapper.toLoginResponse(mockUser, '');

      expect(result.access_token).toBe('');
    });
  });

  // ======================
  // sanitizeUser METHOD TESTS
  // ======================
  describe('sanitizeUser', () => {
    it('should remove password from user object', () => {
      const result = AuthMapper.sanitizeUser(mockUser);

      expect(result).not.toHaveProperty('password');
    });

    it('should keep all other user properties', () => {
      const result = AuthMapper.sanitizeUser(mockUser);

      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('username', mockUser.username);
      expect(result).toHaveProperty('nama_lengkap', mockUser.nama_lengkap);
      expect(result).toHaveProperty('roles', mockUser.roles);
    });

    it('should return a new object', () => {
      const result = AuthMapper.sanitizeUser(mockUser);

      expect(result).not.toBe(mockUser);
    });

    it('should handle user with additional properties', () => {
      const userWithExtra = {
        ...mockUser,
        email: 'test@example.com',
        phone: '1234567890',
      } as any;

      const result = AuthMapper.sanitizeUser(userWithExtra);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(result).toHaveProperty('phone', '1234567890');
    });
  });

  // ======================
  // EDGE CASES
  // ======================
  describe('Edge Cases', () => {
    it('should handle user with userId 0', () => {
      const userWithZeroId = { ...mockUser, id: 0 } as User;

      const tokenPayload = AuthMapper.toTokenPayload(userWithZeroId);
      expect(tokenPayload.userId).toBe(0);

      const loginResponse = AuthMapper.toLoginResponse(userWithZeroId, mockAccessToken);
      expect(loginResponse.user.id).toBe(0);
    });

    it('should handle user with very long username', () => {
      const userWithLongUsername = {
        ...mockUser,
        username: 'a'.repeat(1000),
      } as User;

      const result = AuthMapper.toTokenPayload(userWithLongUsername);

      expect(result.username).toHaveLength(1000);
    });

    it('should handle user with special characters in nama_lengkap', () => {
      const userWithSpecialChars = {
        ...mockUser,
        nama_lengkap: 'Test User @#$%^&*()',
      } as User;

      const result = AuthMapper.toLoginResponse(userWithSpecialChars, mockAccessToken);

      expect(result.user.nama_lengkap).toBe('Test User @#$%^&*()');
    });

    it('should handle user with empty nama_lengkap', () => {
      const userWithEmptyName = {
        ...mockUser,
        nama_lengkap: '',
      } as User;

      const result = AuthMapper.toLoginResponse(userWithEmptyName, mockAccessToken);

      expect(result.user.nama_lengkap).toBe('');
    });

    it('should handle very long access token', () => {
      const longToken = 'a'.repeat(10000);

      const result = AuthMapper.toLoginResponse(mockUser, longToken);

      expect(result.access_token).toHaveLength(10000);
    });
  });
});