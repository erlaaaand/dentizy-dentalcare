import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { PatientRepository } from './repositories/patients.repository';
import { PatientQueryBuilder } from './utils/patient-query.builder';
import { MedicalRecordNumberGenerator } from './utils/medical-record-number.generator';
import { PatientValidator } from './utils/patient.validator';
import { TransactionManager } from './utils/transaction.manager';
import { PatientCacheService } from './services/patient-cache.service';
import { PatientMapper } from './utils/patient.mapper';
import { PatientCreatedEvent } from './events/patient-created.event';
import { PatientUpdatedEvent } from './events/patient-updated.event';
import { PatientDeletedEvent } from './events/patient-deleted.event';

@Injectable()
export class PatientsService {
    private readonly logger = new Logger(PatientsService.name);

    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        private readonly customPatientRepository: PatientRepository,
        private readonly dataSource: DataSource,
        private readonly queryBuilder: PatientQueryBuilder,
        private readonly recordGenerator: MedicalRecordNumberGenerator,
        private readonly validator: PatientValidator,
        private readonly transactionManager: TransactionManager,
        private readonly cacheService: PatientCacheService,
        private readonly mapper: PatientMapper,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /**
     * Buat pasien baru dengan transaction dan retry mechanism
     */
    async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
        const patient = await this.transactionManager.executeWithRetry(async (queryRunner) => {
            // Validasi business logic
            await this.validator.validateCreate(createPatientDto);

            // Generate nomor rekam medis
            const nomorRekamMedis = await this.recordGenerator.generate();

            // Buat dan simpan pasien
            const newPatient = queryRunner.manager.create(Patient, {
                ...createPatientDto,
                nomor_rekam_medis: nomorRekamMedis,
                tanggal_lahir: createPatientDto.tanggal_lahir
                    ? new Date(createPatientDto.tanggal_lahir)
                    : undefined,
                is_active: true,
            });

            const savedPatient = await queryRunner.manager.save(newPatient);
            this.logger.log(`✅ Patient created: ${savedPatient.nama_lengkap} (${savedPatient.nomor_rekam_medis})`);

            return savedPatient;
        });

        // Emit event untuk listener
        this.eventEmitter.emit('patient.created', new PatientCreatedEvent(patient));

        // Invalidate list caches
        await this.cacheService.invalidateListCaches();

        return this.mapper.toResponseDto(patient);
    }

    /**
     * Ambil semua pasien dengan pagination
     */
    async findAll(query: SearchPatientDto): Promise<any> {
        return this.cacheService.getCachedListOrSearch(query, async () => {
            try {
                const { page = 1, limit = 10 } = query;
                const skip = (page - 1) * limit;

                const [patients, total] = await this.patientRepository.findAndCount({
                    where: { is_active: true },
                    order: { created_at: 'DESC' },
                    select: [
                        'id', 'nomor_rekam_medis', 'nik', 'nama_lengkap',
                        'tanggal_lahir', 'jenis_kelamin', 'email', 'no_hp',
                        'alamat', 'is_active', 'created_at', 'updated_at'
                    ],
                    take: limit,
                    skip: skip,
                });

                this.logger.log(`📋 Retrieved ${patients.length}/${total} patients (page ${page})`);

                return {
                    data: this.mapper.toResponseDtoList(patients),
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                };
            } catch (error) {
                this.logger.error('❌ Error fetching patients:', error);
                throw new BadRequestException('Gagal mengambil daftar pasien');
            }
        });
    }

    /**
     * Search pasien dengan full features
     */
    async search(query: SearchPatientDto): Promise<any> {
        return this.cacheService.getCachedListOrSearch(query, async () => {
            try {
                this.validator.validateSearchQuery(query);

                const { page = 1, limit = 10 } = query;
                const skip = (page - 1) * limit;

                // Build query dengan filter dan sorting
                const queryBuilderInstance = this.queryBuilder.build(
                    this.patientRepository.createQueryBuilder('patient'),
                    query
                );

                // Apply pagination
                queryBuilderInstance.take(limit).skip(skip);

                const [patients, total] = await queryBuilderInstance.getManyAndCount();

                this.logger.log(
                    `🔍 Search: "${query.search || 'all'}" | Results: ${patients.length}/${total}`
                );

                return {
                    data: this.mapper.toResponseDtoList(patients),
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                };
            } catch (error) {
                if (error instanceof BadRequestException) throw error;
                this.logger.error('❌ Error searching patients:', error.stack);
                throw new BadRequestException('Gagal mencari pasien. Silakan coba lagi.');
            }
        });
    }

    /**
     * Get statistics untuk dashboard
     */
    async getStatistics(): Promise<{
        total: number;
        new_this_month: number;
        active: number;
        with_allergies: number;
    }> {
        return this.cacheService.getCachedStats(async () => {
            return this.customPatientRepository.getStatistics();
        });
    }

    async findOne(id: number): Promise<PatientResponseDto> {
        return this.cacheService.getCachedPatient(id, async () => {
            try {
                const patient = await this.patientRepository.findOne({
                    where: { id },
                    relations: ['appointments', 'medical_records'],
                });

                if (!patient) {
                    throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
                }

                return this.mapper.toResponseDto(patient);
            } catch (error) {
                if (error instanceof NotFoundException) throw error;
                this.logger.error(`❌ Error finding patient ID ${id}:`, error);
                throw new BadRequestException('Gagal mengambil data pasien');
            }
        });
    }

    async findByMedicalRecordNumber(nomorRekamMedis: string): Promise<PatientResponseDto> {
        const patient = await this.findByField('nomor_rekam_medis', nomorRekamMedis, 'nomor rekam medis');
        return this.mapper.toResponseDto(patient);
    }

    async findByNik(nik: string): Promise<PatientResponseDto> {
        const patient = await this.findByField('nik', nik, 'NIK');
        return this.mapper.toResponseDto(patient);
    }

    async findByDoctor(doctorId: number, query: SearchPatientDto): Promise<any> {
        try {
            const { page = 1, limit = 10, search } = query;
            const skip = (page - 1) * limit;

            const qb = this.patientRepository
                .createQueryBuilder('patient')
                .leftJoin('patient.appointments', 'appointment')
                .where('appointment.doctor_id = :doctorId', { doctorId })
                .andWhere('patient.is_active = :is_active', { is_active: true });

            if (search) {
                qb.andWhere(
                    '(patient.nama_lengkap LIKE :search OR patient.nik LIKE :search OR patient.nomor_rekam_medis LIKE :search OR patient.email LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            qb.distinct(true)
                .orderBy('patient.created_at', 'DESC')
                .skip(skip)
                .take(limit);

            const [patients, total] = await qb.getManyAndCount();

            return {
                data: this.mapper.toResponseDtoList(patients),
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            this.logger.error('❌ Error in findByDoctor:', error);
            throw new BadRequestException('Gagal mengambil daftar pasien untuk dokter');
        }
    }

    async update(id: number, updatePatientDto: UpdatePatientDto): Promise<PatientResponseDto> {
        try {
            const patient = await this.patientRepository.findOneBy({ id });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            // Validasi update
            await this.validator.validateUpdate(id, updatePatientDto);

            // Update data
            Object.assign(patient, updatePatientDto);

            if (updatePatientDto.tanggal_lahir) {
                patient.tanggal_lahir = new Date(updatePatientDto.tanggal_lahir);
            }

            const updatedPatient = await this.patientRepository.save(patient);
            this.logger.log(`✅ Patient updated: #${id} - ${updatedPatient.nama_lengkap}`);

            // Emit event
            this.eventEmitter.emit('patient.updated', new PatientUpdatedEvent(id, updatePatientDto));

            // Invalidate caches
            await this.cacheService.invalidatePatientCache(id);
            await this.cacheService.invalidateListCaches();

            return this.mapper.toResponseDto(updatedPatient);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`❌ Error updating patient ID ${id}:`, error);
            throw new BadRequestException('Gagal mengupdate data pasien');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { id },
                relations: ['appointments'],
            });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            // Check for active appointments
            const hasActiveAppointments = patient.appointments?.some(
                app => ['dijadwalkan', 'sedang_berlangsung'].includes(app.status)
            );

            if (hasActiveAppointments) {
                throw new ConflictException(
                    'Tidak bisa menghapus pasien yang memiliki janji temu aktif'
                );
            }

            const patientName = patient.nama_lengkap;

            // Soft delete
            await this.customPatientRepository.softDelete(id);
            this.logger.log(`🗑️ Patient soft deleted: #${id} - ${patientName}`);

            // Emit event
            this.eventEmitter.emit('patient.deleted', new PatientDeletedEvent(id, patientName));

            // Invalidate caches
            await this.cacheService.invalidatePatientCache(id);
            await this.cacheService.invalidateListCaches();

            return { message: `Pasien ${patientName} berhasil dihapus` };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            this.logger.error(`❌ Error deleting patient ID ${id}:`, error);
            throw new BadRequestException('Gagal menghapus pasien');
        }
    }

    async restore(id: number): Promise<{ message: string }> {
        try {
            const patient = await this.customPatientRepository.findSoftDeletedById(id);
            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan atau tidak dihapus`);
            }
            await this.customPatientRepository.restore(id);
            this.logger.log(`♻️ Patient restored: #${id} - ${patient.nama_lengkap}`);
            // Invalidate caches
            await this.cacheService.invalidatePatientCache(id);
            await this.cacheService.invalidateListCaches();
            return { message: `Pasien ${patient.nama_lengkap} berhasil dipulihkan` };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error(`❌ Error restoring patient ID ${id}:`, error);
            throw new BadRequestException('Gagal memulihkan pasien');
        }
    }

    /**
     * Helper method untuk find by field
     */
    private async findByField(field: string, value: string, fieldLabel: string): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { [field]: value } as any,
                relations: ['appointments', 'medical_records'],
            });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ${fieldLabel} ${value} tidak ditemukan`);
            }

            return patient;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`❌ Error finding patient by ${fieldLabel}:`, error);
            throw new BadRequestException('Gagal mencari pasien');
        }
    }
}