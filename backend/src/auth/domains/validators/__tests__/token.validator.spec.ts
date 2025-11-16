// backend/src/auth/domains/validators/__tests__/token.validator.spec.ts
import { UnauthorizedException } from '@nestjs/common';
import { TokenValidator } from '../token.validator';

// ======================
// MOCK DATA
// ======================
const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwic3ViIjoxfQ.signature';
const mockAuthHeader = `Bearer ${mockValidToken}`;

// ======================
// TEST SUITE
// ======================
describe('TokenValidator', () => {
  it('should be defined', () => {
    expect(TokenValidator).toBeDefined();
  });

  // ======================
  // validateTokenFormat METHOD TESTS
  // ======================
  describe('validateTokenFormat', () => {
    describe('Valid Token Format', () => {
      it('should accept valid JWT token', () => {
        expect(() =>
          TokenValidator.validateTokenFormat(mockValidToken),
        ).not.toThrow();
      });

      it('should accept token with three parts', () => {
        const token = 'header.payload.signature';
        expect(() => TokenValidator.validateTokenFormat(token)).not.toThrow();
      });

      it('should accept token with long parts', () => {
        const token = `${'a'.repeat(100)}.${'b'.repeat(100)}.${'c'.repeat(100)}`;
        expect(() => TokenValidator.validateTokenFormat(token)).not.toThrow();
      });

      it('should accept token with base64 characters', () => {
        const token = 'abc123+/=.def456+/=.ghi789+/=';
        expect(() => TokenValidator.validateTokenFormat(token)).not.toThrow();
      });
    });

    describe('Invalid Token Format', () => {
      it('should throw error for empty token', () => {
        expect(() => TokenValidator.validateTokenFormat('')).toThrow(
          UnauthorizedException,
        );
        expect(() => TokenValidator.validateTokenFormat('')).toThrow(
          'Token is required',
        );
      });

      it('should throw error for null token', () => {
        expect(() =>
          TokenValidator.validateTokenFormat(null as any),
        ).toThrow(UnauthorizedException);
      });

      it('should throw error for undefined token', () => {
        expect(() =>
          TokenValidator.validateTokenFormat(undefined as any),
        ).toThrow(UnauthorizedException);
      });

      it('should throw error for token with only one part', () => {
        expect(() => TokenValidator.validateTokenFormat('singlepart')).toThrow(
          UnauthorizedException,
        );
        expect(() => TokenValidator.validateTokenFormat('singlepart')).toThrow(
          'Invalid token format',
        );
      });

      it('should throw error for token with two parts', () => {
        expect(() => TokenValidator.validateTokenFormat('part1.part2')).toThrow(
          UnauthorizedException,
        );
        expect(() => TokenValidator.validateTokenFormat('part1.part2')).toThrow(
          'Invalid token format',
        );
      });

      it('should throw error for token with four parts', () => {
        expect(() =>
          TokenValidator.validateTokenFormat('part1.part2.part3.part4'),
        ).toThrow(UnauthorizedException);
      });

      it('should throw error for token with empty header', () => {
        expect(() =>
          TokenValidator.validateTokenFormat('.payload.signature'),
        ).toThrow(UnauthorizedException);
        expect(() =>
          TokenValidator.validateTokenFormat('.payload.signature'),
        ).toThrow('Invalid token structure');
      });

      it('should throw error for token with empty payload', () => {
        expect(() =>
          TokenValidator.validateTokenFormat('header..signature'),
        ).toThrow(UnauthorizedException);
        expect(() =>
          TokenValidator.validateTokenFormat('header..signature'),
        ).toThrow('Invalid token structure');
      });

      it('should throw error for token with empty signature', () => {
        expect(() =>
          TokenValidator.validateTokenFormat('header.payload.'),
        ).toThrow(UnauthorizedException);
        expect(() =>
          TokenValidator.validateTokenFormat('header.payload.'),
        ).toThrow('Invalid token structure');
      });

      it('should throw error for token with all empty parts', () => {
        expect(() => TokenValidator.validateTokenFormat('..')).toThrow(
          UnauthorizedException,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle token with whitespace', () => {
        expect(() =>
          TokenValidator.validateTokenFormat('header.payload.signature '),
        ).not.toThrow();
      });

      it('should handle token with special characters in parts', () => {
        expect(() =>
          TokenValidator.validateTokenFormat('h@#$.p@#$.s@#$'),
        ).not.toThrow();
      });

      it('should handle very long token', () => {
        const longToken = `${'a'.repeat(10000)}.${'b'.repeat(10000)}.${'c'.repeat(10000)}`;
        expect(() => TokenValidator.validateTokenFormat(longToken)).not.toThrow();
      });

      it('should handle token with numbers only', () => {
        expect(() =>
          TokenValidator.validateTokenFormat('123.456.789'),
        ).not.toThrow();
      });
    });
  });

  // ======================
  // extractBearerToken METHOD TESTS
  // ======================
  describe('extractBearerToken', () => {
    describe('Valid Authorization Header', () => {
      it('should extract token from valid Bearer header', () => {
        const token = TokenValidator.extractBearerToken(mockAuthHeader);

        expect(token).toBe(mockValidToken);
      });

      it('should extract token with Bearer prefix', () => {
        const authHeader = 'Bearer mytoken123';
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe('mytoken123');
      });

      it('should handle token with extra spaces', () => {
        const authHeader = 'Bearer  token123';
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe('token123');
      });

      it('should extract long token', () => {
        const longToken = 'a'.repeat(1000);
        const authHeader = `Bearer ${longToken}`;
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe(longToken);
      });

      it('should extract token with special characters', () => {
        const specialToken = 'token@#$%^&*()';
        const authHeader = `Bearer ${specialToken}`;
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe(specialToken);
      });
    });

    describe('Invalid Authorization Header', () => {
      it('should throw error for empty header', () => {
        expect(() => TokenValidator.extractBearerToken('')).toThrow(
          UnauthorizedException,
        );
        expect(() => TokenValidator.extractBearerToken('')).toThrow(
          'Authorization header is required',
        );
      });

      it('should throw error for null header', () => {
        expect(() => TokenValidator.extractBearerToken(null as any)).toThrow(
          UnauthorizedException,
        );
      });

      it('should throw error for undefined header', () => {
        expect(() =>
          TokenValidator.extractBearerToken(undefined as any),
        ).toThrow(UnauthorizedException);
      });

      it('should throw error for header without Bearer prefix', () => {
        expect(() => TokenValidator.extractBearerToken('token123')).toThrow(
          UnauthorizedException,
        );
        expect(() => TokenValidator.extractBearerToken('token123')).toThrow(
          'Invalid authorization type',
        );
      });

      it('should throw error for Basic auth header', () => {
        expect(() =>
          TokenValidator.extractBearerToken('Basic token123'),
        ).toThrow(UnauthorizedException);
        expect(() =>
          TokenValidator.extractBearerToken('Basic token123'),
        ).toThrow('Invalid authorization type');
      });

      it('should throw error for lowercase bearer', () => {
        expect(() =>
          TokenValidator.extractBearerToken('bearer token123'),
        ).toThrow(UnauthorizedException);
      });

      it('should throw error for BEARER in uppercase', () => {
        expect(() =>
          TokenValidator.extractBearerToken('BEARER token123'),
        ).toThrow(UnauthorizedException);
      });

      it('should throw error for Bearer without token', () => {
        expect(() => TokenValidator.extractBearerToken('Bearer')).toThrow(
          UnauthorizedException,
        );
        expect(() => TokenValidator.extractBearerToken('Bearer')).toThrow(
          'Token not provided',
        );
      });

      it('should throw error for Bearer with only space', () => {
        expect(() => TokenValidator.extractBearerToken('Bearer ')).toThrow(
          UnauthorizedException,
        );
        expect(() => TokenValidator.extractBearerToken('Bearer ')).toThrow(
          'Token not provided',
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle header with multiple spaces between Bearer and token', () => {
        const authHeader = 'Bearer   token123';
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe('token123');
      });

      it('should handle token that looks like another auth type', () => {
        const authHeader = 'Bearer Basic123';
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe('Basic123');
      });

      it('should handle token with Bearer in its content', () => {
        const authHeader = 'Bearer BearerToken123';
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe('BearerToken123');
      });

      it('should extract token even with trailing content', () => {
        const authHeader = 'Bearer token123 extra';
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe('token123 extra');
      });

      it('should handle header with tabs', () => {
        const authHeader = 'Bearer\ttoken123';
        const token = TokenValidator.extractBearerToken(authHeader);

        expect(token).toBe('token123');
      });
    });
  });

  // ======================
  // INTEGRATION TESTS
  // ======================
  describe('Integration Scenarios', () => {
    it('should validate and extract valid token', () => {
      const token = TokenValidator.extractBearerToken(mockAuthHeader);
      expect(() => TokenValidator.validateTokenFormat(token)).not.toThrow();
      expect(token).toBe(mockValidToken);
    });

    it('should handle complete token validation flow', () => {
      const authHeader = 'Bearer header.payload.signature';
      const token = TokenValidator.extractBearerToken(authHeader);

      expect(token).toBe('header.payload.signature');
      expect(() => TokenValidator.validateTokenFormat(token)).not.toThrow();
    });

    it('should fail on invalid token after extraction', () => {
      const authHeader = 'Bearer invalid-token';
      const token = TokenValidator.extractBearerToken(authHeader);

      expect(token).toBe('invalid-token');
      expect(() => TokenValidator.validateTokenFormat(token)).toThrow(
        UnauthorizedException,
      );
    });

    it('should fail on malformed header before validation', () => {
      expect(() => TokenValidator.extractBearerToken('Basic token')).toThrow(
        UnauthorizedException,
      );
    });

    it('should handle valid JWT token end-to-end', () => {
      const validJWT = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const authHeader = `Bearer ${validJWT}`;

      const extractedToken = TokenValidator.extractBearerToken(authHeader);
      expect(extractedToken).toBe(validJWT);

      expect(() => TokenValidator.validateTokenFormat(extractedToken)).not.toThrow();
    });

    it('should reject invalid token at validation stage', () => {
      const invalidToken = 'not.a.valid.jwt.token';
      const authHeader = `Bearer ${invalidToken}`;

      const extractedToken = TokenValidator.extractBearerToken(authHeader);
      expect(() => TokenValidator.validateTokenFormat(extractedToken)).toThrow();
    });
  });
});