import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector);
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
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as any;
    });

    describe('Public Routes', () => {
      it('should allow access to public routes', () => {
        reflector.getAllAndOverride.mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should check for IS_PUBLIC_KEY metadata', () => {
        reflector.getAllAndOverride.mockReturnValue(true);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
          IS_PUBLIC_KEY,
          [mockContext.getHandler(), mockContext.getClass()],
        );
      });

      it('should bypass JWT validation for public routes', () => {
        reflector.getAllAndOverride.mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });

      it('should return true immediately for public routes', () => {
        reflector.getAllAndOverride.mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(result).toBe(true);
      });
    });

    describe('Protected Routes', () => {
      it('should delegate to parent guard for protected routes', () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        const superCanActivate = jest
          .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
          .mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(superCanActivate).toHaveBeenCalledWith(mockContext);
      });

      it('should validate JWT for protected routes', () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        jest
          .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
          .mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(result).toBeTruthy();
      });

      it('should check metadata first', () => {
        reflector.getAllAndOverride.mockReturnValue(false);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalled();
      });
    });

    describe('Metadata Checking', () => {
      it('should check both handler and class metadata', () => {
        reflector.getAllAndOverride.mockReturnValue(false);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
          IS_PUBLIC_KEY,
          expect.arrayContaining([
            mockContext.getHandler(),
            mockContext.getClass(),
          ]),
        );
      });

      it('should handle missing metadata', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalled();
      });

      it('should handle null metadata', () => {
        reflector.getAllAndOverride.mockReturnValue(null);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalled();
      });
    });

    describe('Edge Cases', () => {
      it('should handle reflector returning false', () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        jest
          .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
          .mockReturnValue(true);

        const result = guard.canActivate(mockContext);

        expect(result).toBeTruthy();
      });

      it('should handle reflector returning undefined', () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        guard.canActivate(mockContext);

        expect(reflector.getAllAndOverride).toHaveBeenCalled();
      });
    });
  });
});