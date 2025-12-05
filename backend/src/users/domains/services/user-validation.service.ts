// domains/services/user-validation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructures/repositories/user.repository';

@Injectable()
export class UserValidationService {
    private readonly logger = new Logger(UserValidationService.name);

    // [FIX 1] Tambahkan Constructor untuk inject repository
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    /**
     * Validate username uniqueness
     */
    validateUsernameUniqueness(
        existingUser: any | null,
        newUsername: string,
        currentUsername?: string
    ): void {
        if (existingUser && existingUser.username !== currentUsername) {
            throw new ConflictException(`Username "${newUsername}" sudah digunakan`);
        }
    }

    /**
     * Validate user exists
     */
    validateUserExists(user: any | null, userId: number): void {
        if (!user) {
            throw new NotFoundException(`User dengan ID #${userId} tidak ditemukan`);
        }
    }

    /**
     * Validate roles exist
     */
    validateRolesExist(requestedRoleIds: number[], foundRoles: any[]): void {
        if (foundRoles.length !== requestedRoleIds.length) {
            const foundIds = foundRoles.map(r => r.id);
            const missingIds = requestedRoleIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(
                `Role dengan ID ${missingIds.join(', ')} tidak ditemukan`
            );
        }
    }

    /**
     * Validate password match
     */
    validatePasswordsMatch(password: string, confirmPassword: string): void {
        if (password !== confirmPassword) {
            throw new ConflictException('Password dan konfirmasi password tidak sama');
        }
    }

    /**
     * Validate user can be deleted
     */
    validateCanDelete(user: any): { canDelete: boolean; reason?: string } {
        if (user.medical_records && user.medical_records.length > 0) {
            return {
                canDelete: false,
                reason: 'User memiliki medical records dan tidak dapat dihapus'
            };
        }
        return { canDelete: true };
    }

    /**
     * Validate username format
     */
    validateUsernameFormat(username: string): { valid: boolean; message?: string } {
        if (!username || username.trim().length === 0) {
            return { valid: false, message: 'Username tidak boleh kosong' };
        }

        if (username.length < 3) {
            return { valid: false, message: 'Username minimal 3 karakter' };
        }

        if (username.length > 50) {
            return { valid: false, message: 'Username maksimal 50 karakter' };
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return {
                valid: false,
                message: 'Username hanya boleh mengandung huruf, angka, dan underscore'
            };
        }

        return { valid: true };
    }

    // [FIX 2] Validasi Email Unik (Pastikan method findByEmail ada di Repository!)
    async validateUniqueEmail(email: string, currentUserId?: number): Promise<void> {
        const existingUser = await this.userRepository.findByEmail(email);
        
        // Jika user ditemukan dan ID-nya BUKAN user yang sedang diedit -> Error
        if (existingUser && existingUser.id !== currentUserId) {
            throw new ConflictException(`Email "${email}" sudah digunakan oleh pengguna lain`);
        }
    }
}