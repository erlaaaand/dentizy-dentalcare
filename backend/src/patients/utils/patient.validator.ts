import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { SearchPatientDto } from '../dto/search-patient.dto';

@Injectable()
export class PatientValidator {
    /**
     * Validasi search query
     */
    validateSearchQuery(query: SearchPatientDto): void {
        this.validateAgeRange(query.umur_min, query.umur_max);
        this.validateDateRange(query.tanggal_daftar_dari, query.tanggal_daftar_sampai);
        this.validateSearchLength(query.search);
    }

    /**
     * Validasi saat create patient
     */
    async validateCreate(dto: CreatePatientDto, queryRunner: any): Promise<void> {
        await this.checkNikUniqueness(dto.nik, queryRunner);
        await this.checkEmailUniqueness(dto.email, queryRunner);
        this.validateBirthDate(dto.tanggal_lahir);
    }

    /**
     * Validasi saat update patient
     */
    async validateUpdate(
        id: number,
        dto: UpdatePatientDto,
        repository: Repository<Patient>
    ): Promise<void> {
        const patient = await repository.findOneBy({ id });

        if (!patient) {
            throw new BadRequestException(`Pasien dengan ID #${id} tidak ditemukan`);
        }

        if (dto.nik && dto.nik !== patient.nik) {
            const existing = await repository.findOne({ where: { nik: dto.nik } });
            if (existing) {
                throw new ConflictException(`NIK ${dto.nik} sudah digunakan`);
            }
        }

        if (dto.email && dto.email !== patient.email) {
            const existing = await repository.findOne({ where: { email: dto.email } });
            if (existing) {
                throw new ConflictException(`Email ${dto.email} sudah digunakan`);
            }
        }

        this.validateBirthDate(dto.tanggal_lahir);
    }

    private validateAgeRange(minAge?: number, maxAge?: number): void {
        if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
            throw new BadRequestException('Umur minimal tidak boleh lebih besar dari umur maksimal');
        }
    }

    private validateDateRange(dateFrom?: string, dateTo?: string): void {
        if (dateFrom && dateTo) {
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            if (from > to) {
                throw new BadRequestException('Tanggal dari tidak boleh lebih besar dari tanggal sampai');
            }
        }
    }

    private validateSearchLength(search?: string): void {
        if (search && search.length < 2) {
            throw new BadRequestException('Pencarian minimal 2 karakter');
        }
    }

    private validateBirthDate(birthDate?: string | Date): void {
        if (birthDate) {
            const date = new Date(birthDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (date > today) {
                throw new BadRequestException('Tanggal lahir tidak boleh di masa depan');
            }
        }
    }

    private async checkNikUniqueness(nik: string | undefined, queryRunner: any): Promise<void> {
        if (!nik) return;

        const existing = await queryRunner.manager.findOne(Patient, {
            where: { nik }
        });
        if (existing) {
            throw new ConflictException(`Pasien dengan NIK ${nik} sudah terdaftar`);
        }
    }

    private async checkEmailUniqueness(email: string | undefined, queryRunner: any): Promise<void> {
        if (!email) return;

        const existing = await queryRunner.manager.findOne(Patient, {
            where: { email }
        });
        if (existing) {
            throw new ConflictException(`Pasien dengan email ${email} sudah terdaftar`);
        }
    }
}