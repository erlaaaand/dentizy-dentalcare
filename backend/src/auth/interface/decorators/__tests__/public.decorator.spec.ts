import { Public, IS_PUBLIC_KEY } from '../public.decorator';
import { SetMetadata } from '@nestjs/common';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Public Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(Public).toBeDefined();
  });

  it('should have IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should call SetMetadata with correct arguments', () => {
    Public();

    expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);
  });

  it('should set metadata key to isPublic', () => {
    Public();

    expect(SetMetadata).toHaveBeenCalledWith('isPublic', true);
  });

  it('should set metadata value to true', () => {
    Public();

    expect(SetMetadata).toHaveBeenCalledWith(expect.any(String), true);
  });
});
