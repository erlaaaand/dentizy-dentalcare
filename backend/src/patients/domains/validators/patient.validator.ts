import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../../application/dto/create-patient.dto';
import { UpdatePatientDto } from '../../application/dto/update-patient.dto';
import { SearchPatientDto } from '../../application/dto/search-patient.dto';

@Injectable()
export class PatientValidator {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>
    ) { }

    /**
     * Validate search query comprehensively
     */
    validateSearchQuery(query: SearchPatientDto): void {
        this.validateAgeRange(query.umur_min, query.umur_max);
        this.validateDateRange(query.tanggal_daftar_dari, query.tanggal_daftar_sampai);
        this.validateSearchLength(query.search);
        this.validatePagination(query.page, query.limit);
    }

    /**
     * Validate create patient data
     */
    async validateCreate(dto: CreatePatientDto): Promise<void> {
        await this.validateUniqueFields(dto);
        this.validateBirthDate(dto.tanggal_lahir);
        this.validatePhoneNumber(dto.no_hp);

        // Business rule: Patient must have at least one contact
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
            const existing = await this.patientRepository.findOne({
                where: { nik: dto.nik }
            });
            if (existing && existing.id !== id) {
                throw new ConflictException(`NIK ${dto.nik} sudah terdaftar`);
            }
        }

        // Validate email uniqueness if changed
        if (dto.email && dto.email !== patient.email) {
            const existing = await this.patientRepository.findOne({
                where: { email: dto.email }
            });
            if (existing && existing.id !== id) {
                throw new ConflictException(`Email ${dto.email} sudah terdaftar`);
            }
        }

        this.validateBirthDate(dto.tanggal_lahir);
        this.validatePhoneNumber(dto.no_hp);

        // Business rule: Don't remove all contacts
        const newNoHp = dto.no_hp !== undefined ? dto.no_hp : patient.no_hp;
        const newEmail = dto.email !== undefined ? dto.email : patient.email;

        if (!newNoHp && !newEmail) {
            throw new BadRequestException(
                'Pasien harus memiliki minimal satu kontak (nomor HP atau email)'
            );
        }
    }

    /**
     * Validate unique fields (NIK, Email)
     */
    private async validateUniqueFields(dto: CreatePatientDto): Promise<void> {
        if (dto.nik) {
            const existsByNik = await this.patientRepository.findOne({
                where: { nik: dto.nik }
            });
            if (existsByNik) {
                throw new ConflictException(`Pasien dengan NIK ${dto.nik} sudah terdaftar`);
            }
        }

        if (dto.email) {
            const existsByEmail = await this.patientRepository.findOne({
                where: { email: dto.email }
            });
            if (existsByEmail) {
                throw new ConflictException(`Pasien dengan email ${dto.email} sudah terdaftar`);
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
            const trimmed = search.trim();

            if (trimmed.length < 2) {
                throw new BadRequestException('Pencarian minimal 2 karakter');
            }

            if (trimmed.length > 255) {
                throw new BadRequestException('Pencarian maksimal 255 karakter');
            }

            // Check for SQL injection patterns
            const dangerousPatterns = /(\bSELECT\b|\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b|\bUNION\b)/gi;
            if (dangerousPatterns.test(trimmed)) {
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

        const date = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(date.getTime())) {
            throw new BadRequestException('Format tanggal lahir tidak valid');
        }

        if (date > today) {
            throw new BadRequestException('Tanggal lahir tidak boleh di masa depan');
        }

        const maxYearsAgo = new Date();
        maxYearsAgo.setFullYear(maxYearsAgo.getFullYear() - 150);

        if (date < maxYearsAgo) {
            throw new BadRequestException(
                'Tanggal lahir tidak valid (lebih dari 150 tahun yang lalu)'
            );
        }
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