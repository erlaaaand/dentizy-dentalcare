// domains/services/credential-validation.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CredentialValidationService {
    private readonly logger = new Logger(CredentialValidationService.name);

    // Business rules
    private readonly MIN_USERNAME_LENGTH = 3;
    private readonly MAX_USERNAME_LENGTH = 50;
    private readonly MIN_PASSWORD_LENGTH = 8;

    /**
     * Validate username format
     */
    validateUsername(username: string): { valid: boolean; message?: string } {
        if (!username || username.trim().length === 0) {
            return { valid: false, message: 'Username tidak boleh kosong' };
        }

        if (username.length < this.MIN_USERNAME_LENGTH) {
            return {
                valid: false,
                message: `Username minimal ${this.MIN_USERNAME_LENGTH} karakter`
            };
        }

        if (username.length > this.MAX_USERNAME_LENGTH) {
            return {
                valid: false,
                message: `Username maksimal ${this.MAX_USERNAME_LENGTH} karakter`
            };
        }

        // Username hanya boleh alphanumeric dan underscore
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return {
                valid: false,
                message: 'Username hanya boleh mengandung huruf, angka, dan underscore'
            };
        }

        return { valid: true };
    }

    /**
     * Validate password format (not strength, just basic format)
     */
    validatePasswordFormat(password: string): { valid: boolean; message?: string } {
        if (!password || password.length === 0) {
            return { valid: false, message: 'Password tidak boleh kosong' };
        }

        if (password.length < this.MIN_PASSWORD_LENGTH) {
            return {
                valid: false,
                message: `Password minimal ${this.MIN_PASSWORD_LENGTH} karakter`
            };
        }

        return { valid: true };
    }

    /**
     * Validate credentials completely
     */
    validateCredentials(username: string, password: string): {
        valid: boolean;
        errors: string[]
    } {
        const errors: string[] = [];

        const usernameResult = this.validateUsername(username);
        if (!usernameResult.valid && usernameResult.message) {
            errors.push(usernameResult.message);
        }

        const passwordResult = this.validatePasswordFormat(password);
        if (!passwordResult.valid && passwordResult.message) {
            errors.push(passwordResult.message);
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}