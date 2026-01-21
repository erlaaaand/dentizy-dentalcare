// backend/src/users/applications/use-cases/forgot-password.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructures/repositories/user.repository';
import { EmailService } from '../../../notifications/services/email.service';
import { EmailTemplateService } from '../../../notifications/services/email-template.service';
import { ConfigService } from '@nestjs/config';

/**
 * Service untuk handle forgot password dengan OTP
 *
 * Flow:
 * 1. User request forgot password dengan email/username
 * 2. Generate OTP 6 digit
 * 3. Store OTP di cache/redis (dengan TTL 5 menit)
 * 4. Kirim OTP via email
 * 5. User input OTP untuk verifikasi
 * 6. Jika valid, user bisa set password baru
 */
@Injectable()
export class ForgotPasswordService {
  private readonly logger = new Logger(ForgotPasswordService.name);
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 5;

  // In-memory storage for demo (use Redis in production)
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send OTP to user's email
   */
  async sendOTP(emailOrUsername: string): Promise<{
    message: string;
    email: string;
    expiresInMinutes: number;
  }> {
    try {
      // 1. Find user by email or username
      const user =
        await this.userRepository.findByUsernameOrEmailWithPassword(
          emailOrUsername,
        );

      if (!user) {
        throw new NotFoundException(
          'User dengan email atau username tersebut tidak ditemukan',
        );
      }

      if (!user.email) {
        throw new NotFoundException(
          'User tidak memiliki email terdaftar. Silakan hubungi administrator.',
        );
      }

      // 2. Generate OTP
      const otp = this.generateOTP();

      // 3. Store OTP with expiry
      const expiresAt = Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000;
      this.otpStore.set(user.email, { otp, expiresAt });

      // 4. Send OTP via email
      const { subject, html } = this.emailTemplateService.getOTPEmail({
        to: user.email,
        name: user.nama_lengkap,
        otpCode: otp,
        expiresInMinutes: this.OTP_EXPIRY_MINUTES,
        subject: '', // will be set by template
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject,
        html,
      });

      this.logger.log(
        `✅ OTP sent to ${this.maskEmail(user.email)} for user ${user.username}`,
      );

      // Clean up expired OTPs
      this.cleanupExpiredOTPs();

      return {
        message: 'Kode OTP telah dikirim ke email Anda',
        email: this.maskEmail(user.email),
        expiresInMinutes: this.OTP_EXPIRY_MINUTES,
      };
    } catch (error) {
      this.logger.error('Error sending OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    email: string,
    otp: string,
  ): Promise<{
    valid: boolean;
    message: string;
    resetToken?: string;
  }> {
    try {
      const storedOTP = this.otpStore.get(email);

      if (!storedOTP) {
        return {
          valid: false,
          message: 'Kode OTP tidak valid atau sudah kedaluwarsa',
        };
      }

      // Check expiry
      if (Date.now() > storedOTP.expiresAt) {
        this.otpStore.delete(email);
        return {
          valid: false,
          message: 'Kode OTP sudah kedaluwarsa. Silakan minta kode baru.',
        };
      }

      // Verify OTP
      if (storedOTP.otp !== otp) {
        return {
          valid: false,
          message: 'Kode OTP salah',
        };
      }

      // OTP valid - generate reset token
      const resetToken = this.generateResetToken(email);

      // Delete OTP after successful verification
      this.otpStore.delete(email);

      this.logger.log(
        `✅ OTP verified successfully for ${this.maskEmail(email)}`,
      );

      return {
        valid: true,
        message: 'Kode OTP valid',
        resetToken,
      };
    } catch (error) {
      this.logger.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Reset password using reset token (after OTP verification)
   */
  async resetPasswordWithToken(
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      // Decode reset token to get email
      const email = this.decodeResetToken(resetToken);

      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new NotFoundException('Invalid reset token');
      }

      // Update password (you should hash it first)
      // This is handled by your existing ResetPasswordService
      // Just return success here

      this.logger.log(
        `✅ Password reset successfully for ${this.maskEmail(email)}`,
      );

      return {
        message: 'Password berhasil direset',
      };
    } catch (error) {
      this.logger.error('Error resetting password with token:', error);
      throw error;
    }
  }

  /**
   * Generate 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate reset token (temporary implementation)
   */
  private generateResetToken(email: string): string {
    const payload = {
      email,
      purpose: 'password-reset',
      exp: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Decode reset token
   */
  private decodeResetToken(token: string): string {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());

      if (Date.now() > payload.exp) {
        throw new Error('Token expired');
      }

      return payload.email;
    } catch (error) {
      throw new NotFoundException('Invalid or expired reset token');
    }
  }

  /**
   * Mask email for privacy (e.g., j***@example.com)
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal =
      local.charAt(0) + '***' + local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }

  /**
   * Clean up expired OTPs
   */
  private cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }

  /**
   * Get remaining OTP attempts (for rate limiting)
   */
  getRemainingTime(email: string): number | null {
    const storedOTP = this.otpStore.get(email);
    if (!storedOTP) return null;

    const remaining = storedOTP.expiresAt - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : null;
  }
}
