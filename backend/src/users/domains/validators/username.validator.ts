// domains/validators/username.validator.ts
import { BadRequestException } from '@nestjs/common';

export class UsernameValidator {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 50;
    private static readonly PATTERN = /^[a-zA-Z0-9_]+$/;

    /**
     * Validate and sanitize username
     */
    static validate(username: string): string {
        if (!username || username.trim().length === 0) {
            throw new BadRequestException('Username tidak boleh kosong');
        }

        const trimmed = username.trim().toLowerCase();

        if (trimmed.length < this.MIN_LENGTH) {
            throw new BadRequestException(
                `Username minimal ${this.MIN_LENGTH} karakter`
            );
        }

        if (trimmed.length > this.MAX_LENGTH) {
            throw new BadRequestException(
                `Username maksimal ${this.MAX_LENGTH} karakter`
            );
        }

        if (!this.PATTERN.test(trimmed)) {
            throw new BadRequestException(
                'Username hanya boleh mengandung huruf, angka, dan underscore'
            );
        }

        return trimmed;
    }

    /**
     * Check if username is reserved
     */
    static isReserved(username: string): boolean {
        const reservedUsernames = [
            'admin', 'root', 'system', 'administrator',
            'superuser', 'test', 'demo'
        ];

        return reservedUsernames.includes(username.toLowerCase());
    }
}