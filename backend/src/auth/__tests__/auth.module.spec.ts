// backend/src/auth/__tests__/auth.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth.module';
import { AuthController } from '../interface/http/auth.controller';
import { AuthService } from '../applications/orchestrator/auth.service';
import { LoginService } from '../applications/use-cases/login.service';
import { TokenVerificationService } from '../applications/use-cases/token-verification.service';
import { TokenRefreshService } from '../applications/use-cases/token-refresh.service';
import { LogoutService } from '../applications/use-cases/logout.service';
import { TokenService } from '../domains/services/token.service';
import { CredentialValidationService } from '../domains/services/credential-validation.service';
import { SecurityGuardService } from '../domains/services/security-guard.service';
import { PasswordHasherService } from '../infrastructures/security/password-hasher.service';
import { TimingDefenseService } from '../infrastructures/security/timing-defense.service';
import { JwtStrategy } from '../infrastructures/strategies/jwt.strategy';
import { RolesGuard } from '../interface/guards/roles.guard';
import { JwtAuthGuard } from '../interface/guards/jwt-auth.guard';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AuthModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  describe('Module Configuration', () => {
    it('should have AuthController registered', () => {
      const controller = module.get<AuthController>(AuthController);
      expect(controller).toBeDefined();
      expect(controller).toBeInstanceOf(AuthController);
    });

    it('should have AuthService registered', () => {
      const service = module.get<AuthService>(AuthService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(AuthService);
    });
  });

  describe('Use Cases Providers', () => {
    it('should have LoginService registered', () => {
      const service = module.get<LoginService>(LoginService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(LoginService);
    });

    it('should have TokenVerificationService registered', () => {
      const service = module.get<TokenVerificationService>(TokenVerificationService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TokenVerificationService);
    });

    it('should have TokenRefreshService registered', () => {
      const service = module.get<TokenRefreshService>(TokenRefreshService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TokenRefreshService);
    });

    it('should have LogoutService registered', () => {
      const service = module.get<LogoutService>(LogoutService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(LogoutService);
    });
  });

  describe('Domain Services Providers', () => {
    it('should have TokenService registered', () => {
      const service = module.get<TokenService>(TokenService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TokenService);
    });

    it('should have CredentialValidationService registered', () => {
      const service = module.get<CredentialValidationService>(CredentialValidationService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CredentialValidationService);
    });

    it('should have SecurityGuardService registered', () => {
      const service = module.get<SecurityGuardService>(SecurityGuardService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(SecurityGuardService);
    });
  });

  describe('Infrastructure Services Providers', () => {
    it('should have PasswordHasherService registered', () => {
      const service = module.get<PasswordHasherService>(PasswordHasherService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(PasswordHasherService);
    });

    it('should have TimingDefenseService registered', () => {
      const service = module.get<TimingDefenseService>(TimingDefenseService);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(TimingDefenseService);
    });
  });

  describe('Strategies and Guards', () => {
    it('should have JwtStrategy registered', () => {
      const strategy = module.get<JwtStrategy>(JwtStrategy);
      expect(strategy).toBeDefined();
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });

    it('should have RolesGuard registered', () => {
      const guard = module.get<RolesGuard>(RolesGuard);
      expect(guard).toBeDefined();
      expect(guard).toBeInstanceOf(RolesGuard);
    });

    it('should have JwtAuthGuard registered', () => {
      const guard = module.get<JwtAuthGuard>(JwtAuthGuard);
      expect(guard).toBeDefined();
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });

  describe('Module Exports', () => {
    it('should export AuthService', () => {
      const service = module.get<AuthService>(AuthService);
      expect(service).toBeDefined();
    });

    it('should export JwtStrategy', () => {
      const strategy = module.get<JwtStrategy>(JwtStrategy);
      expect(strategy).toBeDefined();
    });

    it('should export JwtAuthGuard', () => {
      const guard = module.get<JwtAuthGuard>(JwtAuthGuard);
      expect(guard).toBeDefined();
    });

    it('should export RolesGuard', () => {
      const guard = module.get<RolesGuard>(RolesGuard);
      expect(guard).toBeDefined();
    });
  });
});