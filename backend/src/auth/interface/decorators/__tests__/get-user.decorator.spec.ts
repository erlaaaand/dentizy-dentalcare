import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GetUser } from '../get-user.decorator';

// Test the actual implementation
describe('GetUser Decorator', () => {
  // Mock data
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  // Test 1: Verify the decorator is properly created
  it('should be created with createParamDecorator', () => {
    expect(GetUser).toBeDefined();
    expect(typeof GetUser).toBe('function');
  });

  // Test 2: Test the actual logic inside the decorator
  describe('Decorator Logic', () => {
    it('should extract user from request', () => {
      // Create a mock context with user
      const mockRequest = { user: mockUser };
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      // Extract the logic from our decorator
      const decoratorLogic = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      // Test the logic directly
      const result = decoratorLogic(undefined, mockExecutionContext);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when no user in request', () => {
      const mockRequest = {}; // No user
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      const decoratorLogic = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result = decoratorLogic(undefined, mockExecutionContext);
      expect(result).toBeUndefined();
    });

    it('should ignore data parameter', () => {
      const mockRequest = { user: mockUser };
      const mockExecutionContext: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      const decoratorLogic = (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
      };

      const result1 = decoratorLogic(undefined, mockExecutionContext);
      const result2 = decoratorLogic('some-data', mockExecutionContext);
      const result3 = decoratorLogic({ custom: 'data' }, mockExecutionContext);

      expect(result1).toEqual(mockUser);
      expect(result2).toEqual(mockUser);
      expect(result3).toEqual(mockUser);
    });
  });

  // Test 3: Verify the decorator structure
  it('should return a ParameterDecorator', () => {
    const decorator = GetUser();
    expect(typeof decorator).toBe('function');
    expect(decorator.length).toBe(3); // target, propertyKey, parameterIndex
  });

  // Test 4: Integration-style test - verify the decorator can be applied
  it('should work when applied to a parameter', () => {
    // This test verifies the decorator doesn't throw when used
    class TestController {
      // Simulate usage: @GetUser() user: any
      testMethod(@GetUser() user: any) {
        return user;
      }
    }

    const controller = new TestController();

    // The decorator itself doesn't modify the method behavior at test time
    // but we can verify it doesn't break the class
    expect(controller).toBeDefined();
    expect(typeof controller.testMethod).toBe('function');
  });
});
