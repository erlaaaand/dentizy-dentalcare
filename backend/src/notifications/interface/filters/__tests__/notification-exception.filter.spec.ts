// __tests__/interface/filters/notification-exception.filter.spec.ts

// 1. IMPORTS
import { ArgumentsHost, HttpException, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import {
  NotificationExceptionFilter,
  NotificationHttpExceptionFilter,
  ValidationExceptionFilter,
} from '../../../interface/filters/notification-exception.filter';

// 2. MOCK DATA
const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
const mockResponse = {
  status: mockStatus,
} as unknown as Response;

const mockRequest = {
  method: 'POST',
  url: '/notifications',
  headers: { 'user-agent': 'Jest-Test' },
  ip: '127.0.0.1',
  user: { id: 'user-123' },
} as unknown as Request;

const mockArgumentsHost = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn().mockReturnValue(mockResponse),
  }),
} as unknown as ArgumentsHost;

// Mocking Logger to avoid console spam and verify calls
const mockLoggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation();
const mockLoggerWarn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
const mockLoggerLog = jest.spyOn(Logger.prototype, 'log').mockImplementation();

// 3. TEST SUITE
describe('Exception Filters', () => {
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // SUITE A: NotificationExceptionFilter
  // ==========================================
  describe('NotificationExceptionFilter', () => {
    let filter: NotificationExceptionFilter;

    // 4. SETUP
    beforeEach(() => {
      filter = new NotificationExceptionFilter();
    });

    // 5. EXECUTE METHOD TESTS
    it('should catch HttpException and return standardized JSON response', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Forbidden',
          path: '/notifications',
        }),
      );
    });

    it('should catch unknown errors and return 500 Internal Server Error', () => {
      const exception = new Error('Unexpected database crash');

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
      // Verify Logging
      expect(mockLoggerError).toHaveBeenCalled();
    });

    // 6. SUB-GROUP TESTS (Environment & Logger Logic)
    describe('Environment Specifics', () => {
      it('should include detailed stack trace in development mode', () => {
        process.env.NODE_ENV = 'development';
        const exception = new Error('Dev Error');

        filter.catch(exception, mockArgumentsHost);

        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Error',
            stack: expect.any(String),
          }),
        );
      });

      it('should NOT include stack trace in production mode', () => {
        process.env.NODE_ENV = 'production';
        const exception = new Error('Prod Error');

        filter.catch(exception, mockArgumentsHost);

        const responseData = mockJson.mock.calls[0][0];
        expect(responseData).not.toHaveProperty('stack');
        expect(responseData).not.toHaveProperty('error');
      });
    });

    describe('Logging Levels', () => {
      it('should log warn for client errors (4xx)', () => {
        const exception = new BadRequestException('Bad Input');
        filter.catch(exception, mockArgumentsHost);
        expect(mockLoggerWarn).toHaveBeenCalled();
      });

      it('should log error for server errors (5xx)', () => {
        const exception = new HttpException('Server Fail', HttpStatus.INTERNAL_SERVER_ERROR);
        filter.catch(exception, mockArgumentsHost);
        expect(mockLoggerError).toHaveBeenCalled();
      });
    });
  });

  // ==========================================
  // SUITE B: NotificationHttpExceptionFilter
  // ==========================================
  describe('NotificationHttpExceptionFilter', () => {
    let filter: NotificationHttpExceptionFilter;

    beforeEach(() => {
      filter = new NotificationHttpExceptionFilter();
    });

    it('should return basic response for generic HttpExceptions', () => {
      const exception = new HttpException('Generic Error', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockArgumentsHost);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Generic Error',
        })
      );
      // Should NOT have context/suggestion
      const response = mockJson.mock.calls[0][0];
      expect(response).not.toHaveProperty('context');
    });

    // 6. SUB-GROUP TESTS (Suggestions)
    describe('Contextual Suggestions', () => {
      it('should add suggestion context when error message contains "notification"', () => {
        const exception = new HttpException('Notification service failed', HttpStatus.NOT_FOUND);
        
        filter.catch(exception, mockArgumentsHost);

        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            context: 'notification',
            suggestion: 'Check if the notification ID exists', // Suggestion for 404
          })
        );
      });

      it('should provide correct suggestion for RATE_LIMIT (Too Many Requests)', () => {
        const exception = new HttpException('Email send limit reached', HttpStatus.TOO_MANY_REQUESTS);
        
        filter.catch(exception, mockArgumentsHost);

        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            context: 'notification', // "Email" triggers isNotificationError
            suggestion: 'Rate limit exceeded, please try again later',
          })
        );
      });

      it('should provide correct suggestion for CONFLICT', () => {
        const exception = new HttpException('Reminder already processed', HttpStatus.CONFLICT);
        
        filter.catch(exception, mockArgumentsHost);

        expect(mockJson).toHaveBeenCalledWith(
          expect.objectContaining({
            context: 'notification', // "Reminder" triggers isNotificationError
            suggestion: 'Notification may already be processed',
          })
        );
      });
    });
  });

  // ==========================================
  // SUITE C: ValidationExceptionFilter
  // ==========================================
  describe('ValidationExceptionFilter', () => {
    let filter: ValidationExceptionFilter;

    beforeEach(() => {
      filter = new ValidationExceptionFilter();
    });

    it('should handle class-validator array errors', () => {
      // Simulate typical BadRequestException thrown by ValidationPipe
      const validationErrors = ['email must be an email', 'name is required'];
      const exception = {
        response: {
          message: validationErrors,
          error: 'Bad Request',
          statusCode: 400
        },
        getStatus: () => 400,
      };

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          errors: validationErrors,
        })
      );
      expect(mockLoggerWarn).toHaveBeenCalled();
    });

    it('should fallback to standard handling for non-validation errors', () => {
      const exception = new HttpException('Standard Error', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Standard Error',
        })
      );
      // Should NOT have errors array
      const response = mockJson.mock.calls[0][0];
      expect(response).not.toHaveProperty('errors');
    });
  });
});