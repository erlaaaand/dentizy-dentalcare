// patients.service.ts (Refactored)

import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PatientRepository } from './repositories/patients.repository';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { PatientQueryBuilder } from './utils/patient-query.builder';
import { MedicalRecordNumberGenerator } from './utils/medical-record-number.generator';
import { PatientValidator } from './utils/patient.validator';
import { PatientResponseDto } from './dto/patient-response.dto';
import { PatientCacheService } from './services/patient-cache.service'; // <-- BARU
import { PatientMapper } from './utils/patient.mapper'; // <-- BARU

// Event interfaces (tetap sama)
export interface PatientCreatedEvent {
    patient: any;
}
export interface PatientUpdatedEvent {
    patientId: any;
    changes(changes: any): string | undefined;
}
export interface PatientDeletedEvent {
    patientId: any;
    patientName: any;
}

@Injectable()
export class PatientsService {
    private readonly logger = new Logger(PatientsService.name);

    constructor(
        private readonly patientRepository: PatientRepository,
        private readonly queryBuilder: PatientQueryBuilder,
        private readonly recordGenerator: MedicalRecordNumberGenerator,
        private readonly validator: PatientValidator,
        private readonly eventEmitter: EventEmitter2,
        private readonly cacheService: PatientCacheService, // <-- Injeksi BARU
        private readonly mapper: PatientMapper, // <-- Injeksi BARU
    ) { }

    /**
     * Create patient
     */
    async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
        try {
            await this.validator.validateCreate(createPatientDto);
            const nomorRekamMedis = await this.recordGenerator.generate();

            const patient = this.patientRepository.create({
                ...createPatientDto,
                nomor_rekam_medis: nomorRekamMedis,
                tanggal_lahir: createPatientDto.tanggal_lahir
                    ? new Date(createPatientDto.tanggal_lahir)
                    : undefined,
            });

            const savedPatient = await this.patientRepository.save(patient);

            this.eventEmitter.emit('patient.created', {
                patient: savedPatient,
                timestamp: new Date(),
            } as PatientCreatedEvent);

            // Delegasikan ke cache service
            await this.cacheService.invalidateListCaches();

            this.logger.log(
                `✅ Patient created: ${savedPatient.nama_lengkap} (${savedPatient.nomor_rekam_medis})`,
            );

            // Delegasikan ke mapper
            return this.mapper.toResponseDto(savedPatient);
        } catch (error) {
            this.logger.error('❌ Error creating patient:', error.stack);
            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new BadRequestException('Gagal membuat data pasien');
        }
    }

    /**
     * Get all patients (dibungkus cache)
     */
    async findAll(query: SearchPatientDto): Promise<{
        data: PatientResponseDto[];
        pagination: any;
    }> {
        // Gunakan wrapper dari cache service
        return this.cacheService.getCachedListOrSearch(query, async () => {
            this.logger.debug(`📦 Cache miss: findAll. Fetching from DB...`);
            const { page = 1, limit = 10 } = query;
            const skip = (page - 1) * limit;

            const [patients, total] = await this.patientRepository.findAndCount({
                where: { is_active: true },
                order: { created_at: 'DESC' },
                take: limit,
                skip: skip,
            });

            this.logger.log(`📋 Retrieved ${patients.length}/${total} patients (page ${page})`);

            return {
                data: this.mapper.toResponseDtoList(patients), // Gunakan mapper
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPreviousPage: page > 1,
                },
            };
        });
    }

    /**
     * Real-time search (dibungkus cache)
     */
    async search(query: SearchPatientDto): Promise<{
        data: PatientResponseDto[];
        pagination: any;
        searchInfo?: any;
    }> {
        try {
            this.validator.validateSearchQuery(query);

            // Gunakan wrapper dari cache service
            return this.cacheService.getCachedListOrSearch(query, async () => {
                this.logger.debug(`📦 Cache miss: search. Fetching from DB...`);
                const { page = 1, limit = 10 } = query;
                const skip = (page - 1) * limit;

                const queryBuilderInstance = this.queryBuilder
                    .build(this.patientRepository.createSearchQuery(query), query)
                    .take(limit)
                    .skip(skip);

                const [patients, total] = await queryBuilderInstance.getManyAndCount();

                this.logger.log(
                    `🔍 Search: "${query.search || 'all'}" | Results: ${patients.length}/${total}`,
                );

                return {
                    data: this.mapper.toResponseDtoList(patients), // Gunakan mapper
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                        hasNextPage: page < Math.ceil(total / limit),
                        hasPreviousPage: page > 1,
                    },
                    searchInfo: {
                        /* ... (search info Anda sebelumnya) ... */
                    },
                };
            });
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            this.logger.error('❌ Error searching patients:', error.stack);
            throw new BadRequestException('Gagal mencari pasien');
        }
    }

    /**
     * Get one patient by ID (dibungkus cache)
     */
    async findOne(id: number): Promise<PatientResponseDto> {
        // Gunakan wrapper dari cache service
        return this.cacheService.getCachedPatient(id, async () => {
            this.logger.debug(`📦 Cache miss: findOne #${id}. Fetching from DB...`);
            const patient = await this.patientRepository.findOne({
                where: { id },
                relations: ['appointments', 'medical_records'],
            });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }
            return this.mapper.toResponseDto(patient); // Gunakan mapper
        });
    }

    /**
     * Find by medical record number (Umumnya tidak di-cache karena
     * ini adalah pencarian spesifik, kecuali jika sering)
     */
    async findByMedicalRecordNumber(number: string): Promise<PatientResponseDto> {
        const patient = await this.patientRepository.findByMedicalRecordNumber(number);
        if (!patient) {
            throw new NotFoundException(
                `Pasien dengan nomor rekam medis ${number} tidak ditemukan`,
            );
        }
        return this.mapper.toResponseDto(patient);
    }

    /**
     * Find by NIK
     */
    async findByNik(nik: string): Promise<PatientResponseDto> {
        const patient = await this.patientRepository.findByNik(nik);
        if (!patient) {
            throw new NotFoundException(`Pasien dengan NIK ${nik} tidak ditemukan`);
        }
        return this.mapper.toResponseDto(patient);
    }

    /**
     * Find patients by doctor
     * (Logika cache bisa ditambahkan di sini jika perlu,
     * mengikuti pola `getCachedListOrSearch`)
     */
    async findByDoctor(
        doctorId: number,
        query: SearchPatientDto,
    ): Promise<{
        data: PatientResponseDto[];
        pagination: any;
    }> {
        const { page = 1, limit = 10 } = query;
        const [patients, total] = await this.patientRepository.findByDoctorId(
            doctorId,
            page,
            limit,
        );

        return {
            data: this.mapper.toResponseDtoList(patients), // Gunakan mapper
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Update patient
     */
    async update(
        id: number,
        updatePatientDto: UpdatePatientDto,
    ): Promise<PatientResponseDto> {
        try {
            const patient = await this.patientRepository.findOneBy({ id });
            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            await this.validator.validateUpdate(id, updatePatientDto);

            Object.assign(patient, updatePatientDto);
            if (updatePatientDto.tanggal_lahir) {
                patient.tanggal_lahir = new Date(updatePatientDto.tanggal_lahir);
            }

            const updatedPatient = await this.patientRepository.save(patient);

            this.eventEmitter.emit('patient.updated', {
                patientId: id,
                changes: updatePatientDto,
                timestamp: new Date(),
            } as unknown as PatientUpdatedEvent);

            // Delegasikan ke cache service
            await this.cacheService.invalidatePatientCache(id);
            await this.cacheService.invalidateListCaches();

            this.logger.log(`✅ Patient updated: #${id} - ${updatedPatient.nama_lengkap}`);

            return this.mapper.toResponseDto(updatedPatient); // Gunakan mapper
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            this.logger.error(`❌ Error updating patient ID ${id}:`, error.stack);
            throw new BadRequestException('Gagal mengupdate data pasien');
        }
    }

    /**
     * Soft delete patient
     */
    async remove(id: number): Promise<{ message: string }> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { id },
                relations: ['appointments'],
            });
            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            await this.patientRepository.softDelete(id);

            this.eventEmitter.emit('patient.deleted', {
                patientId: id,
                patientName: patient.nama_lengkap,
                timestamp: new Date(),
            } as PatientDeletedEvent);

            // Delegasikan ke cache service
            await this.cacheService.invalidatePatientCache(id);
            await this.cacheService.invalidateListCaches();

            this.logger.log(`🗑️ Patient soft-deleted: #${id} - ${patient.nama_lengkap}`);
            return {
                message: `Pasien ${patient.nama_lengkap} berhasil dihapus`,
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Error deleting patient ID ${id}:`, error.stack);
            throw new BadRequestException('Gagal menghapus pasien');
        }
    }

    /**
     * Get patient statistics
     */
    async getStatistics(): Promise<any> {
        // Gunakan wrapper dari cache service
        return this.cacheService.getCachedStats(async () => {
            this.logger.debug(`📦 Cache miss: getStatistics. Fetching from DB...`);
            return this.patientRepository.getStatistics();
        });
    }

    // SEMUA HELPER PRIBADI (toResponseDto, getCacheKey, invalidate Caches)
    // SEKARANG TELAH DIHAPUS DARI FILE INI.
}