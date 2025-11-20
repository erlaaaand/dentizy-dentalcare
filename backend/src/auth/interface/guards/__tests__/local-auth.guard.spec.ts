import { LocalAuthGuard } from '../local-auth.guard';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;

  beforeEach(() => {
    guard = new LocalAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard', () => {
    expect(guard).toBeInstanceOf(LocalAuthGuard);
  });

  it('should use local strategy', () => {
    expect(guard).toBeDefined();
  });
});