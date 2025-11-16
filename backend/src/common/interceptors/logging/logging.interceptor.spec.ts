import { Test, TestingModule } from '@nestjs/testing';
import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Mock library uuid
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
const mockUuidv4 = uuidv4 as jest.Mock;

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockContext: ExecutionContext;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCallHandler: CallHandler;

  // Spy untuk memantau output Logger
  const loggerSpies = {
    log: jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { }),
    warn: jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { }),
    error: jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { }),
    debug: jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => { }),
  };

  // Menggunakan timer palsu untuk mengontrol Date.now()
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);

    jest.clearAllMocks();
    mockUuidv4.mockReturnValue('test-request-id');

    mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'TestAgent' },
      body: {},
      user: { id: 1, username: 'testuser' },
    };

    mockResponse = {
      statusCode: 200,
      setHeader: jest.fn(),
    };

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  // ===================================
  // TEST CASES
  // ===================================

  describe('Successful Request (Happy Path)', () => {
    beforeEach(() => {
      // [DIUBAH] Pindahkan simulasi waktu ke dalam handle()
      mockCallHandler = {
        handle: () => {
          // Simulasikan 50ms durasi
          jest.advanceTimersByTime(50);
          return of({ success: true, token: 'secret-token' });
        },
      };
      jest.setSystemTime(new Date('2023-01-01T10:00:00Z'));
    });

    it('should log request and successful response', (done) => {
      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          // [DIHAPUS] Baris advanceTimersByTime dihapus dari sini

          // Verifikasi log request awal
          expect(loggerSpies.log).toHaveBeenCalledWith(
            '[test-request-id] [GET] /test | User: testuser (ID: 1) | IP: 127.0.0.1',
          );

          // Verifikasi log response sukses (sekarang harus berisi 50ms)
          expect(loggerSpies.log).toHaveBeenCalledWith(
            expect.stringContaining(
              '[test-request-id] [GET] /test | Status: 200 | 50ms | User: testuser',
            ),
          );

          expect(loggerSpies.warn).not.toHaveBeenCalled();
          expect(loggerSpies.error).not.toHaveBeenCalled();
          done(); // done() sekarang akan terpanggil
        });
    });

    it('should set X-Request-ID header and attach requestId to request', (done) => {
      // Test ini tidak bergantung pada timer, jadi tidak perlu diubah
      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Request-ID',
            'test-request-id',
          );
          expect((mockRequest as any).requestId).toBe('test-request-id');
          done();
        });
    });

    it('should use existing x-request-id header if present', (done) => {
      // Test ini tidak bergantung pada timer, jadi tidak perlu diubah
      mockRequest.headers!['x-request-id'] = 'existing-id';

      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          expect(mockUuidv4).not.toHaveBeenCalled();
          expect(mockResponse.setHeader).toHaveBeenCalledWith(
            'X-Request-ID',
            'existing-id',
          );
          expect(loggerSpies.log).toHaveBeenCalledWith(
            expect.stringContaining('[existing-id]'),
          );
          done();
        });
    });
  });

  describe('Error Handling', () => {
    const testError = new Error('Test Error');
    (testError as any).status = 500;

    beforeEach(() => {
      // [DIUBAH] Pindahkan simulasi waktu ke dalam handle()
      mockCallHandler = {
        handle: () => {
          // Simulasikan 75ms durasi
          jest.advanceTimersByTime(75);
          return throwError(() => testError);
        },
      };
      jest.setSystemTime(new Date('2023-01-01T10:00:00Z'));
    });

    it('should log error response correctly', (done) => {
      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        error: (err) => {
          // [DIHAPUS] Baris advanceTimersByTime dihapus dari sini

          expect(loggerSpies.log).toHaveBeenCalledWith(
            '[test-request-id] [GET] /test | User: testuser (ID: 1) | IP: 127.0.0.1',
          );

          // Verifikasi log error utama (sekarang harus berisi 75ms)
          expect(loggerSpies.error).toHaveBeenCalledWith(
            expect.stringContaining(
              '[test-request-id] [GET] /test | Status: 500 | 75ms | User: testuser | Error: Test Error',
            ),
          );

          expect(loggerSpies.error).toHaveBeenCalledWith(
            expect.stringContaining(
              `[test-request-id] Error Context: { userId: 1, ip: 127.0.0.1, userAgent: TestAgent }`,
            ),
          );

          expect(err).toBe(testError);
          done(); // done() sekarang akan terpanggil
        },
      });
    });
  });

  describe('Masking and Data Logging', () => {
    // Test ini tidak bergantung pada timer, jadi tidak perlu diubah
    beforeEach(() => {
      mockCallHandler = {
        handle: () =>
          of({
            username: 'erland',
            access_token: 'secret-token-123',
            refresh_token: 'secret-refresh-456',
          }),
      };
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should mask sensitive fields in request body', (done) => {
      mockRequest.body = {
        username: 'test',
        password: 'my-secret-password',
        nested: {
          token: 'another-token',
        },
      };

      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          expect(loggerSpies.debug).toHaveBeenCalledWith(
            expect.stringContaining(
              `"username": "test",\n` +
              `  "password": "***MASKED***",\n` +
              `  "nested": {\n` +
              `    "token": "***MASKED***"\n` +
              `  }`,
            ),
          );
          done();
        });
    });

    it('should mask sensitive fields in response data (dev mode)', (done) => {
      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          expect(loggerSpies.debug).toHaveBeenCalledWith(
            expect.stringContaining(
              `"username": "erland",\n` +
              `  "access_token": "***MASKED***",\n` +
              `  "refresh_token": "***MASKED***"`,
            ),
          );
          done();
        });
    });

    it('should NOT log response data in production mode', (done) => {
      process.env.NODE_ENV = 'production';

      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          expect(loggerSpies.debug).not.toHaveBeenCalledWith(
            expect.stringContaining('Response Data:'),
          );
          done();
        });
    });
  });

  describe('Slow Response Warnings', () => {
    beforeEach(() => {
      jest.setSystemTime(new Date('2023-01-01T10:00:00Z'));
    });

    it('should log a WARN for responses > 1000ms', (done) => {
      // [DIUBAH] Pindahkan simulasi waktu ke dalam handle()
      mockCallHandler = {
        handle: () => {
          jest.advanceTimersByTime(1500); // Simulasikan 1500ms
          return of({ success: true });
        },
      };

      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          // [DIHAPUS] Baris advanceTimersByTime dihapus dari sini

          // Peringatan dari tap() (sekarang 1500ms)
          expect(loggerSpies.warn).toHaveBeenCalledWith(
            '[test-request-id] ⚠️ Slow Response: [GET] /test took 1500ms',
          );
          // Peringatan dari trackPerformanceMetrics() (sekarang 1500ms)
          expect(loggerSpies.warn).toHaveBeenCalledWith(
            '🟡 SLOW ENDPOINT: [GET] /test took 1500ms (status: 200)',
          );
          expect(loggerSpies.error).not.toHaveBeenCalled();
          done(); // done() sekarang akan terpanggil
        });
    });

    it('should log an ERROR for responses > 3000ms', (done) => {
      // [DIUBAH] Pindahkan simulasi waktu ke dalam handle()
      mockCallHandler = {
        handle: () => {
          jest.advanceTimersByTime(3500); // Simulasikan 3500ms
          return of({ success: true });
        },
      };

      interceptor
        .intercept(mockContext, mockCallHandler)
        .subscribe(() => {
          // [DIHAPUS] Baris advanceTimersByTime dihapus dari sini

          // Peringatan dari tap() (sekarang 3500ms)
          expect(loggerSpies.warn).toHaveBeenCalledWith(
            '[test-request-id] ⚠️ Slow Response: [GET] /test took 3500ms',
          );
          // Peringatan dari trackPerformanceMetrics() (sekarang 3500ms)
          expect(loggerSpies.error).toHaveBeenCalledWith(
            '🔴 CRITICAL SLOW ENDPOINT: [GET] /test took 3500ms (status: 200)',
          );
          done(); // done() sekarang akan terpanggil
        });
    });
  });
});