import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { UserRole } from '../../../../roles/entities/role.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
      } as any;
    });

    describe('No Roles Required', () => {
      it('should allow access when no roles are specified', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should allow access when roles array is null', () => {
        reflector.getAllAndOverride.mockReturnValue(null);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should check for ROLES_KEY metadata', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
          mockContext.getHandler(),
          mockContext.getClass(),
        ]);
      });
    });

    describe('Roles Required', () => {
      it('should allow access when user has required role', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: {
            roles: [{ name: UserRole.STAF }],
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should deny access when user lacks required role', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: {
            roles: [{ name: UserRole.DOKTER }], // Changed: user has DOKTER, not STAF
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should allow access when user has one of multiple required roles', () => {
        reflector.getAllAndOverride.mockReturnValue([
          UserRole.STAF,
          UserRole.DOKTER,
        ]);
        const mockRequest = {
          user: {
            roles: [{ name: UserRole.DOKTER }],
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should allow access when user has multiple roles including required', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: {
            roles: [{ name: UserRole.STAF }, { name: UserRole.DOKTER }], // Changed: Added different role
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should deny access when user has no roles', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: {
            roles: [],
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should deny access when user roles is undefined', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: {
            roles: undefined,
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should deny access when user is undefined', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: undefined,
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty required roles array', () => {
        reflector.getAllAndOverride.mockReturnValue([]);
        const mockRequest = {
          user: {
            roles: [{ name: UserRole.STAF }],
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should handle user with null roles', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: {
            roles: null,
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(false);
      });

      it('should check both handler and class metadata', () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.STAF]);
        const mockRequest = {
          user: {
            roles: [{ name: UserRole.STAF }],
          },
        };
        mockContext.switchToHttp().getRequest = jest
          .fn()
          .mockReturnValue(mockRequest);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
          ROLES_KEY,
          expect.arrayContaining([
            mockContext.getHandler(),
            mockContext.getClass(),
          ]),
        );
      });
    });
  });
});
