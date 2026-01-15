// backend/src/auth/applications/dto/__tests__/login-response.dto.spec.ts
import { LoginResponseDto } from '../login-response.dto';

// ======================
// MOCK DATA
// ======================
const mockLoginResponse: LoginResponseDto = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVzdHVzZXIifQ.xyz',
  user: {
    id: 1,
    username: 'testuser',
    nama_lengkap: 'Test User',
    roles: ['staf', 'dokter'],
  },
};

describe('LoginResponseDto', () => {
  let dto: LoginResponseDto;

  beforeEach(() => {
    dto = new LoginResponseDto();
  });

  it('should be defined', () => {
    expect(dto).toBeDefined();
  });

  describe('DTO Structure Tests', () => {
    it('should have access_token property', () => {
      dto.access_token = mockLoginResponse.access_token;
      expect(dto.access_token).toBeDefined();
      expect(typeof dto.access_token).toBe('string');
    });

    it('should have user property', () => {
      dto.user = mockLoginResponse.user;
      expect(dto.user).toBeDefined();
      expect(typeof dto.user).toBe('object');
    });

    it('should accept complete valid data', () => {
      dto.access_token = mockLoginResponse.access_token;
      dto.user = mockLoginResponse.user;

      expect(dto.access_token).toBe(mockLoginResponse.access_token);
      expect(dto.user).toEqual(mockLoginResponse.user);
    });
  });

  describe('User Object Structure', () => {
    beforeEach(() => {
      dto.user = mockLoginResponse.user;
    });

    it('should have id property in user', () => {
      expect(dto.user.id).toBeDefined();
      expect(typeof dto.user.id).toBe('number');
      expect(dto.user.id).toBe(1);
    });

    it('should have username property in user', () => {
      expect(dto.user.username).toBeDefined();
      expect(typeof dto.user.username).toBe('string');
      expect(dto.user.username).toBe('testuser');
    });

    it('should have nama_lengkap property in user', () => {
      expect(dto.user.nama_lengkap).toBeDefined();
      expect(typeof dto.user.nama_lengkap).toBe('string');
      expect(dto.user.nama_lengkap).toBe('Test User');
    });

    it('should have roles property in user', () => {
      expect(dto.user.roles).toBeDefined();
      expect(Array.isArray(dto.user.roles)).toBe(true);
      expect(dto.user.roles).toEqual(['staf', 'dokter']);
    });
  });

  describe('Roles Array Tests', () => {
    it('should accept single role', () => {
      dto.user = {
        id: 1,
        username: 'testuser',
        nama_lengkap: 'Test User',
        roles: ['staf'],
      };

      expect(dto.user.roles.length).toBe(1);
      expect(dto.user.roles[0]).toBe('staf');
    });

    it('should accept multiple roles', () => {
      dto.user = {
        id: 1,
        username: 'testuser',
        nama_lengkap: 'Test User',
        roles: ['admin', 'dokter', 'staf'],
      };

      expect(dto.user.roles.length).toBe(3);
      expect(dto.user.roles).toContain('admin');
      expect(dto.user.roles).toContain('dokter');
      expect(dto.user.roles).toContain('staf');
    });

    it('should accept empty roles array', () => {
      dto.user = {
        id: 1,
        username: 'testuser',
        nama_lengkap: 'Test User',
        roles: [],
      };

      expect(dto.user.roles.length).toBe(0);
      expect(Array.isArray(dto.user.roles)).toBe(true);
    });
  });

  describe('Token Format Tests', () => {
    it('should accept JWT-like token format', () => {
      const jwtToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9.signature';
      dto.access_token = jwtToken;

      expect(dto.access_token).toBe(jwtToken);
      expect(dto.access_token.split('.').length).toBe(3);
    });

    it('should accept any string as access_token', () => {
      const simpleToken = 'simple-token-123';
      dto.access_token = simpleToken;

      expect(dto.access_token).toBe(simpleToken);
    });
  });

  describe('Complete Response Tests', () => {
    it('should create complete response object', () => {
      const response: LoginResponseDto = {
        access_token: 'token123',
        user: {
          id: 5,
          username: 'newuser',
          nama_lengkap: 'New User Name',
          roles: ['dokter'],
        },
      };

      expect(response.access_token).toBe('token123');
      expect(response.user.id).toBe(5);
      expect(response.user.username).toBe('newuser');
      expect(response.user.nama_lengkap).toBe('New User Name');
      expect(response.user.roles).toEqual(['dokter']);
    });

    it('should not have password in user object', () => {
      dto.user = mockLoginResponse.user;
      expect(dto.user).not.toHaveProperty('password');
    });
  });
});
