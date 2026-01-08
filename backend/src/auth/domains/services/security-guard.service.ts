// domains/services/security-guard.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SecurityGuardService {
  private readonly logger = new Logger(SecurityGuardService.name);

  // Security thresholds
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  // In-memory store (production: use Redis)
  private readonly failedAttempts = new Map<
    string,
    { count: number; lockedUntil?: number }
  >();

  /**
   * Check if account is locked due to failed attempts
   */
  isAccountLocked(identifier: string): boolean {
    const attempt = this.failedAttempts.get(identifier);

    if (!attempt) {
      return false;
    }

    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
      this.logger.warn(`Account locked: ${identifier}`);
      return true;
    }

    // Unlock if lockout period has passed
    if (attempt.lockedUntil && Date.now() >= attempt.lockedUntil) {
      this.failedAttempts.delete(identifier);
      return false;
    }

    return false;
  }

  /**
   * Record failed login attempt
   */
  recordFailedAttempt(identifier: string): void {
    const attempt = this.failedAttempts.get(identifier) || { count: 0 };
    attempt.count += 1;

    if (attempt.count >= this.MAX_FAILED_ATTEMPTS) {
      attempt.lockedUntil = Date.now() + this.LOCKOUT_DURATION_MS;
      this.logger.warn(
        `Account locked after ${this.MAX_FAILED_ATTEMPTS} failed attempts: ${identifier}`,
      );
    }

    this.failedAttempts.set(identifier, attempt);
  }

  /**
   * Clear failed attempts on successful login
   */
  clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  /**
   * Get remaining lockout time in seconds
   */
  getRemainingLockoutTime(identifier: string): number {
    const attempt = this.failedAttempts.get(identifier);

    if (!attempt?.lockedUntil) {
      return 0;
    }

    const remaining = Math.max(0, attempt.lockedUntil - Date.now());
    return Math.ceil(remaining / 1000);
  }
}
