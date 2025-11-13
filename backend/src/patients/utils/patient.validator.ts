import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PatientRepository } from '../repositories/patients.repository';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';

@Injectable()
export class PatientValidator {
    constructor(private readonly patientRepository: PatientRepository) { }

    /**
     * Validate search query comprehensively
     */
    validateSearchQuery(query: SearchPatientDto): void {
        // Validate age range
        this.validateAgeRange(query.umur_min, query.umur_max);

        // Validate date range
        this.validateDateRange(query.tanggal_daftar_dari, query.tanggal_daftar_sampai);

        // Validate search length
        this.validateSearchLength(query.search);

        // Validate pagination
        this.validatePagination(query.page, query.limit);
    }

    /**
     * Validate create patient data dengan business rules
     */
    async validateCreate(dto: CreatePatientDto): Promise<void> {
        // Validate unique fields
        await this.validateUniqueFields(dto);

        // Validate birth date
        this.validateBirthDate(dto.tanggal_lahir);

        // Validate phone format
        this.validatePhoneNumber(dto.no_hp);

        // Business rule: Patient harus punya minimal nama dan kontak
        if (!dto.no_hp && !dto.email) {
            throw new BadRequestException(
                'Pasien harus memiliki minimal satu kontak (nomor HP atau email)'
            );
        }
    }

    /**
     * Validate update patient data
     */
    async validateUpdate(id: number, dto: UpdatePatientDto): Promise<void> {
        const patient = await this.patientRepository.findOneBy({ id });

        if (!patient) {
            throw new BadRequestException(`Pasien dengan ID #${id} tidak ditemukan`);
        }

        // Validate NIK uniqueness if changed
        if (dto.nik && dto.nik !== patient.nik) {
            const existing = await this.patientRepository.existsByField('nik', dto.nik);
            if (existing) {
                throw new ConflictException(`NIK ${dto.nik} sudah terdaftar`);
            }
        }

        // Validate email uniqueness if changed
        if (dto.email && dto.email !== patient.email) {
            const existing = await this.patientRepository.existsByField('email', dto.email);
            if (existing) {
                throw new ConflictException(`Email ${dto.email} sudah terdaftar`);
            }
        }

        // Validate birth date
        this.validateBirthDate(dto.tanggal_lahir);

        // Validate phone
        this.validatePhoneNumber(dto.no_hp);

        // Business rule: Jangan hapus semua kontak
        const willHaveContact =
            (dto.no_hp !== '' || patient.no_hp) &&
            (dto.email !== '' || patient.email);

        if (!willHaveContact) {
            throw new BadRequestException(
                'Pasien harus memiliki minimal satu kontak (nomor HP atau email)'
            );
        }
    }

    /**
     * Validate unique fields (NIK, Email)
     */
    private async validateUniqueFields(dto: CreatePatientDto): Promise<void> {
        // Check NIK uniqueness
        if (dto.nik) {
            const existsByNik = await this.patientRepository.existsByField('nik', dto.nik);
            if (existsByNik) {
                throw new ConflictException(`Pasien dengan NIK ${dto.nik} sudah terdaftar`);
            }
        }

        // Check email uniqueness
        if (dto.email) {
            const existsByEmail = await this.patientRepository.existsByField(
                'email',
                dto.email
            );
            if (existsByEmail) {
                throw new ConflictException(
                    `Pasien dengan email ${dto.email} sudah terdaftar`
                );
            }
        }
    }

    /**
     * Validate age range logic
     */
    private validateAgeRange(minAge?: number, maxAge?: number): void {
        if (minAge !== undefined && maxAge !== undefined) {
            if (minAge > maxAge) {
                throw new BadRequestException(
                    'Umur minimal tidak boleh lebih besar dari umur maksimal'
                );
            }

            if (minAge < 0 || maxAge < 0) {
                throw new BadRequestException('Umur tidak boleh negatif');
            }

            if (minAge > 150 || maxAge > 150) {
                throw new BadRequestException('Umur tidak valid (maksimal 150 tahun)');
            }
        }
    }

    /**
     * Validate date range logic
     */
    private validateDateRange(dateFrom?: string, dateTo?: string): void {
        if (dateFrom && dateTo) {
            const from = new Date(dateFrom);
            const to = new Date(dateTo);

            if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                throw new BadRequestException('Format tanggal tidak valid');
            }

            if (from > to) {
                throw new BadRequestException(
                    'Tanggal dari tidak boleh lebih besar dari tanggal sampai'
                );
            }

            // Check if date range is not too far in the past
            const tenYearsAgo = new Date();
            tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

            if (from < tenYearsAgo) {
                throw new BadRequestException(
                    'Pencarian tanggal maksimal 10 tahun ke belakang'
                );
            }
        }
    }

    /**
     * Validate search string length
     */
    private validateSearchLength(search?: string): void {
        if (search) {
            if (search.length < 2) {
                throw new BadRequestException('Pencarian minimal 2 karakter');
            }

            if (search.length > 255) {
                throw new BadRequestException('Pencarian maksimal 255 karakter');
            }

            // Check for SQL injection patterns
            const dangerousPatterns = /(\bSELECT\b|\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/gi;
            if (dangerousPatterns.test(search)) {
                throw new BadRequestException('Pencarian mengandung karakter tidak valid');
            }
        }
    }

    /**
     * Validate pagination parameters
     */
    private validatePagination(page?: number, limit?: number): void {
        if (page !== undefined && page < 1) {
            throw new BadRequestException('Page harus lebih besar dari 0');
        }

        if (limit !== undefined) {
            if (limit < 1) {
                throw new BadRequestException('Limit harus lebih besar dari 0');
            }

            if (limit > 100) {
                throw new BadRequestException('Limit maksimal 100');
            }
        }
    }

    /**
     * Validate birth date business rules
     */
    private validateBirthDate(birthDate?: string | Date): void {
        if (!birthDate) return;

        const date = new Date(birthDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Format tanggal lahir tidak valid');
        }

        // Birth date cannot be in the future
        if (date > today) {
            throw new BadRequestException('Tanggal lahir tidak boleh di masa depan');
        }

        // Birth date cannot be more than 150 years ago
        const maxYearsAgo = new Date();
        maxYearsAgo.setFullYear(maxYearsAgo.getFullYear() - 150);

        if (date < maxYearsAgo) {
            throw new BadRequestException(
                'Tanggal lahir tidak valid (lebih dari 150 tahun yang lalu)'
            );
        }

        // Optional: Warn if patient is too young (< 1 year for dental clinic)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        // This is just a warning, not blocking
        // if (date > oneYearAgo) {
        //     console.warn('Patient is less than 1 year old');
        // }
    }

    /**
     * Validate phone number format
     */
    private validatePhoneNumber(phone?: string): void {
        if (!phone) return;

        const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;

        if (!phoneRegex.test(phone)) {
            throw new BadRequestException(
                'Format nomor HP tidak valid (contoh: 081234567890 atau +628123456789)'
            );
        }

        // Check for repeated digits (likely fake number)
        const repeatedPattern = /(\d)\1{9,}/;
        if (repeatedPattern.test(phone)) {
            throw new BadRequestException(
                'Nomor HP tidak valid (terlalu banyak digit yang sama)'
            );
        }
    }
    
}