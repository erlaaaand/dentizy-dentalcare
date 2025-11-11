// ============================================
// FILE 1: utils/patient-query.builder.ts
// ============================================
import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, Brackets } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { SearchPatientDto, SortField, SortOrder } from '../dto/search-patient.dto';

@Injectable()
export class PatientQueryBuilder {
    /**
     * Menghitung tanggal lahir dari umur
     */
    private calculateBirthDateFromAge(age: number): Date {
        const today = new Date();
        const birthYear = today.getFullYear() - age;
        return new Date(birthYear, today.getMonth(), today.getDate());
    }

    /**
     * Build query dengan semua filter dan sorting
     */
    build(
        queryBuilder: SelectQueryBuilder<Patient>,
        query: SearchPatientDto,
    ): SelectQueryBuilder<Patient> {
        // Select fields
        queryBuilder.select([
            'patient.id',
            'patient.nomor_rekam_medis',
            'patient.nik',
            'patient.nama_lengkap',
            'patient.tanggal_lahir',
            'patient.jenis_kelamin',
            'patient.email',
            'patient.no_hp',
            'patient.alamat',
            'patient.created_at',
            'patient.updated_at',
        ]);

        // Apply filters
        this.applySearchFilter(queryBuilder, query.search);
        this.applyGenderFilter(queryBuilder, query.jenis_kelamin);
        this.applyAgeFilter(queryBuilder, query.umur_min, query.umur_max);
        this.applyDateRangeFilter(queryBuilder, query.tanggal_daftar_dari, query.tanggal_daftar_sampai);
        this.applyDoctorFilter(queryBuilder, query.doctor_id);

        // Apply sorting
        this.applySorting(queryBuilder, query.sortBy, query.sortOrder);

        return queryBuilder;
    }

    private applySearchFilter(qb: SelectQueryBuilder<Patient>, search?: string): void {
        if (search) {
            qb.andWhere(
                new Brackets((subQb) => {
                    subQb.where('patient.nama_lengkap LIKE :search', { search: `%${search}%` })
                        .orWhere('patient.nik LIKE :search', { search: `%${search}%` })
                        .orWhere('patient.nomor_rekam_medis LIKE :search', { search: `%${search}%` })
                        .orWhere('patient.email LIKE :search', { search: `%${search}%` })
                        .orWhere('patient.no_hp LIKE :search', { search: `%${search}%` });
                }),
            );
        }
    }

    private applyGenderFilter(qb: SelectQueryBuilder<Patient>, gender?: string): void {
        if (gender) {
            qb.andWhere('patient.jenis_kelamin = :jenis_kelamin', { jenis_kelamin: gender });
        }
    }

    private applyAgeFilter(qb: SelectQueryBuilder<Patient>, minAge?: number, maxAge?: number): void {
        if (maxAge !== undefined) {
            const maxBirthDate = this.calculateBirthDateFromAge(maxAge);
            qb.andWhere('patient.tanggal_lahir >= :maxBirthDate', {
                maxBirthDate: maxBirthDate.toISOString().split('T')[0],
            });
        }

        if (minAge !== undefined) {
            const minBirthDate = this.calculateBirthDateFromAge(minAge);
            qb.andWhere('patient.tanggal_lahir <= :minBirthDate', {
                minBirthDate: minBirthDate.toISOString().split('T')[0],
            });
        }
    }

    private applyDateRangeFilter(qb: SelectQueryBuilder<Patient>, dateFrom?: string, dateTo?: string): void {
        if (dateFrom) {
            qb.andWhere('DATE(patient.created_at) >= :dateFrom', { dateFrom });
        }
        if (dateTo) {
            qb.andWhere('DATE(patient.created_at) <= :dateTo', { dateTo });
        }
    }

    private applyDoctorFilter(qb: SelectQueryBuilder<Patient>, doctorId?: number): void {
        if (doctorId) {
            qb.leftJoin('patient.appointments', 'appointment')
                .andWhere('appointment.doctor_id = :doctor_id', { doctor_id: doctorId });
        }
    }

    private applySorting(qb: SelectQueryBuilder<Patient>, sortBy?: SortField, sortOrder?: SortOrder): void {
        const field = sortBy || SortField.CREATED_AT;
        const order = sortOrder || SortOrder.DESC;
        qb.orderBy(`patient.${field}`, order.toUpperCase() as 'ASC' | 'DESC');
    }
}





