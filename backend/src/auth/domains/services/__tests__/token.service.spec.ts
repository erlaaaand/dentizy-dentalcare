// backend/src/auth/domains/services/__tests__/token.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../token.service';
import { TokenPayloadDto } from '../../../applications/dto/token-payload.dto';

// ======================
// MOCK DATA
// ======================
const mockTokenPayload: TokenPayloadDto = {
  userId: 1,
  username: 'testuser',
  roles: ['staf', 'dokter'],
};

const mockJwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwic3ViIjoxLCJyb2xlcyI6WyJzdGFmIiwiZG9rdGVyIl0sImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxNjE2MzI1NDIyfQ.signature';

const mockDecodedToken = {
  username: 'testuser',
  sub: 1,
  roles: ['staf', 'dokter'],
  iat: 1616239022,
  exp: 1616325422,
};

// ======================
// TEST SUITE
// ======================
describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // generateToken METHOD TESTS
  // ======================
  describe('generateToken', () => {
    describe('Successful Token Generation', () => {
      beforeEach(() => {
        jwtService.sign.mockReturnValue(mockJwtToken);
      });

      it('should generate token successfully', () => {
        const result = service.generateToken(mockTokenPayload);

        expect(result).toBe(mockJwtToken);
      });

      it('should call jwtService.sign with correct payload', () => {
        service.generateToken(mockTokenPayload);

        expect(jwtService.sign).toHaveBeenCalledWith({
          username: mockTokenPayload.username,
          sub: mockTokenPayload.userId,
          roles: mockTokenPayload.roles,
        });
      });

      it('should include username in token', () => {
        service.generateToken(mockTokenPayload);

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            username: mockTokenPayload.username,
          }),
        );
      });

      it('should include userId as sub', () => {
        service.generateToken(mockTokenPayload);

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            sub: mockTokenPayload.userId,
          }),
        );
      });

      it('should include roles in token', () => {
        service.generateToken(mockTokenPayload);

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            roles: mockTokenPayload.roles,
          }),
        );
      });

      it('should return token string', () => {
        const result = service.generateToken(mockTokenPayload);

        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('Token Generation with Different Payloads', () => {
      beforeEach(() => {
        jwtService.sign.mockReturnValue(mockJwtToken);
      });

      it('should handle user with multiple roles', () => {
        const payload: TokenPayloadDto = {
          userId: 1,
          username: 'admin',
          roles: ['admin', 'dokter', 'staf'],
        };

        service.generateToken(payload);

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            roles: ['admin', 'dokter', 'staf'],
          }),
        );
      });

      it('should handle user with no roles', () => {
        const payload: TokenPayloadDto = {
          userId: 1,
          username: 'user',
          roles: [],
        };

        service.generateToken(payload);

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            roles: [],
          }),
        );
      });

      it('should handle user with single role', () => {
        const payload: TokenPayloadDto = {
          userId: 1,
          username: 'user',
          roles: ['staf'],
        };

        service.generateToken(payload);

        expect(jwtService.sign).toHaveBeenCalledWith(
          expect.objectContaining({
            roles: ['staf'],
          }),
        );
      });
    });

    describe('Token Generation Failures', () => {
      it('should throw error when jwt sign fails', () => {
        jwtService.sign.mockImplementation(() => {
          throw new Error('JWT sign failed');
        });

        expect(() => service.generateToken(mockTokenPayload)).toThrow(
          'Token generation failed',
        );
      });

      it('should handle jwt service errors', () => {
        jwtService.sign.mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        expect(() => service.generateToken(mockTokenPayload)).toThrow();
      });
    });

    describe('Edge Cases', () => {
      beforeEach(() => {
        jwtService.sign.mockReturnValue(mockJwtToken);
      });

      it('should handle userId of 0', () => {
        const payload: TokenPayloadDto = {
          userId: 0,
          username: 'user',
          roles: ['staf'],
        };

        expect(() => service.generateToken(payload)).not.toThrow();
      });

      it('should handle very long username', () => {
        const payload: TokenPayloadDto = {
          userId: 1,
          username: 'a'.repeat(1000),
          roles: ['staf'],
        };

        expect(() => service.generateToken(payload)).not.toThrow();
      });

      it('should handle special characters in username', () => {
        const payload: TokenPayloadDto = {
          userId: 1,
          username: 'user@#$%',
          roles: ['staf'],
        };

        expect(() => service.generateToken(payload)).not.toThrow();
      });
    });
  });

  // ======================
  // verifyToken METHOD TESTS
  // ======================
  describe('verifyToken', () => {
    describe('Successful Token Verification', () => {
      beforeEach(() => {
        jwtService.verify.mockReturnValue(mockDecodedToken);
      });

      it('should verify token successfully', () => {
        const result = service.verifyToken(mockJwtToken);

        expect(result).toEqual({
          userId: mockDecodedToken.sub,
          username: mockDecodedToken.username,
          roles: mockDecodedToken.roles,
        });
      });

      it('should call jwtService.verify with token', () => {
        service.verifyToken(mockJwtToken);

        expect(jwtService.verify).toHaveBeenCalledWith(mockJwtToken);
      });

      it('should extract userId from sub field', () => {
        const result = service.verifyToken(mockJwtToken);

        expect(result.userId).toBe(mockDecodedToken.sub);
      });

      it('should extract username', () => {
        const result = service.verifyToken(mockJwtToken);

        expect(result.username).toBe(mockDecodedToken.username);
      });

      it('should extract roles', () => {
        const result = service.verifyToken(mockJwtToken);

        expect(result.roles).toEqual(mockDecodedToken.roles);
      });

      it('should handle token without roles', () => {
        jwtService.verify.mockReturnValue({
          ...mockDecodedToken,
          roles: undefined,
        });

        const result = service.verifyToken(mockJwtToken);

        expect(result.roles).toEqual([]);
      });
    });

    describe('Token Verification Failures', () => {
      it('should throw error for invalid token', () => {
        jwtService.verify.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        expect(() => service.verifyToken('invalid.token')).toThrow(
          'Invalid or expired token',
        );
      });

      it('should throw error for expired token', () => {
        jwtService.verify.mockImplementation(() => {
          throw new Error('Token expired');
        });

        expect(() => service.verifyToken(mockJwtToken)).toThrow(
          'Invalid or expired token',
        );
      });

      it('should throw error for malformed token', () => {
        jwtService.verify.mockImplementation(() => {
          throw new Error('Malformed token');
        });

        expect(() => service.verifyToken('malformed')).toThrow();
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty token', () => {
        jwtService.verify.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        expect(() => service.verifyToken('')).toThrow();
      });

      it('should handle very long token', () => {
        const longToken = 'a'.repeat(10000);
        jwtService.verify.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        expect(() => service.verifyToken(longToken)).toThrow();
      });
    });
  });

  // ======================
  // decodeToken METHOD TESTS
  // ======================
  describe('decodeToken', () => {
    beforeEach(() => {
      jwtService.decode.mockReturnValue(mockDecodedToken);
    });

    it('should decode token without verification', () => {
      const result = service.decodeToken(mockJwtToken);

      expect(result).toEqual(mockDecodedToken);
    });

    it('should call jwtService.decode', () => {
      service.decodeToken(mockJwtToken);

      expect(jwtService.decode).toHaveBeenCalledWith(mockJwtToken);
    });

    it('should return decoded payload', () => {
      const result = service.decodeToken(mockJwtToken);

      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('roles');
    });

    it('should handle invalid token gracefully', () => {
      jwtService.decode.mockReturnValue(null);

      const result = service.decodeToken('invalid');

      expect(result).toBeNull();
    });
  });

  // ======================
  // isTokenExpired METHOD TESTS
  // ======================
  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      jwtService.verify.mockReturnValue(mockDecodedToken);

      const result = service.isTokenExpired(mockJwtToken);

      expect(result).toBe(false);
    });

    it('should return true for expired token', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = service.isTokenExpired(mockJwtToken);

      expect(result).toBe(true);
    });

    it('should return true for invalid token', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.isTokenExpired('invalid.token');

      expect(result).toBe(true);
    });

    it('should call verify to check expiration', () => {
      jwtService.verify.mockReturnValue(mockDecodedToken);

      service.isTokenExpired(mockJwtToken);

      expect(jwtService.verify).toHaveBeenCalledWith(mockJwtToken);
    });
  });

  // ======================
  // INTEGRATION TESTS
  // ======================
  describe('Integration Scenarios', () => {
    it('should generate and verify token in sequence', () => {
      jwtService.sign.mockReturnValue(mockJwtToken);
      jwtService.verify.mockReturnValue(mockDecodedToken);

      const token = service.generateToken(mockTokenPayload);
      const verified = service.verifyToken(token);

      expect(verified.userId).toBe(mockTokenPayload.userId);
      expect(verified.username).toBe(mockTokenPayload.username);
    });

    it('should handle complete token lifecycle', () => {
      jwtService.sign.mockReturnValue(mockJwtToken);
      jwtService.verify.mockReturnValue(mockDecodedToken);
      jwtService.decode.mockReturnValue(mockDecodedToken);

      const token = service.generateToken(mockTokenPayload);
      expect(service.isTokenExpired(token)).toBe(false);

      const decoded = service.decodeToken(token);
      expect(decoded).toBeDefined();

      const verified = service.verifyToken(token);
      expect(verified.userId).toBe(mockTokenPayload.userId);
    });
  });
});
