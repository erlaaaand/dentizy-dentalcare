// backend/src/auth/applications/use-cases/__tests__/logout.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LogoutService } from '../logout.service';

// ======================
// MOCK DATA
// ======================
const mockUserId = 1;

// ======================
// TEST SUITE
// ======================
describe('LogoutService', () => {
  let service: LogoutService;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // ======================
  // SETUP AND TEARDOWN
  // ======================
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LogoutService>(LogoutService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // EXECUTE METHOD TESTS
  // ======================
  describe('execute', () => {
    describe('Successful Logout', () => {
      it('should successfully logout user', async () => {
        const result = await service.execute(mockUserId);

        expect(result).toEqual({
          message: 'Logout berhasil',
        });
      });

      it('should emit user logged out event', async () => {
        await service.execute(mockUserId);

        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-out',
          expect.objectContaining({
            userId: mockUserId,
            timestamp: expect.any(Date),
          }),
        );
      });

      it('should emit event with correct userId', async () => {
        const testUserId = 123;
        await service.execute(testUserId);

        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-out',
          expect.objectContaining({
            userId: testUserId,
          }),
        );
      });

      it('should return success message', async () => {
        const result = await service.execute(mockUserId);

        expect(result).toHaveProperty('message');
        expect(result.message).toBe('Logout berhasil');
      });
    });

    describe('Multiple Logout Attempts', () => {
      it('should handle multiple logout calls', async () => {
        const result1 = await service.execute(mockUserId);
        const result2 = await service.execute(mockUserId);

        expect(result1).toEqual(result2);
        expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      });

      it('should handle different users logout', async () => {
        await service.execute(1);
        await service.execute(2);
        await service.execute(3);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(3);
        expect(eventEmitter.emit).toHaveBeenNthCalledWith(
          1,
          'user.logged-out',
          expect.objectContaining({ userId: 1 }),
        );
        expect(eventEmitter.emit).toHaveBeenNthCalledWith(
          2,
          'user.logged-out',
          expect.objectContaining({ userId: 2 }),
        );
        expect(eventEmitter.emit).toHaveBeenNthCalledWith(
          3,
          'user.logged-out',
          expect.objectContaining({ userId: 3 }),
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle userId of 0', async () => {
        const result = await service.execute(0);

        expect(result).toBeDefined();
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-out',
          expect.objectContaining({ userId: 0 }),
        );
      });

      it('should handle negative userId', async () => {
        const result = await service.execute(-1);

        expect(result).toBeDefined();
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-out',
          expect.objectContaining({ userId: -1 }),
        );
      });

      it('should handle very large userId', async () => {
        const largeUserId = Number.MAX_SAFE_INTEGER;
        const result = await service.execute(largeUserId);

        expect(result).toBeDefined();
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'user.logged-out',
          expect.objectContaining({ userId: largeUserId }),
        );
      });
    });
  });
});
