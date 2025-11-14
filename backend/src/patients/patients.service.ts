import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { SearchPatientDto } from './dto/search-patient.dto';
import { PatientQueryBuilder } from './utils/patient-query.builder';
import { MedicalRecordNumberGenerator } from './utils/medical-record-number.generator';
import { PatientValidator } from './utils/patient.validator';
import { TransactionManager } from './utils/transaction.manager';

@Injectable()
export class PatientsService {
    private readonly logger = new Logger(PatientsService.name);

    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        private readonly dataSource: DataSource,
        private readonly queryBuilder: PatientQueryBuilder,
        private readonly recordGenerator: MedicalRecordNumberGenerator,
        private readonly validator: PatientValidator,
        private readonly transactionManager: TransactionManager,
    ) { }

    /**
     * Buat pasien baru dengan transaction dan retry mechanism
     */
    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        return this.transactionManager.executeWithRetry(async (queryRunner) => {
            // Validasi business logic
            await this.validator.validateCreate(createPatientDto, queryRunner);

            // Generate nomor rekam medis
            const nomorRekamMedis = await this.recordGenerator.generate(queryRunner);

            // Buat dan simpan pasien
            const newPatient = queryRunner.manager.create(Patient, {
                ...createPatientDto,
                nomor_rekam_medis: nomorRekamMedis,
                tanggal_lahir: createPatientDto.tanggal_lahir
                    ? new Date(createPatientDto.tanggal_lahir)
                    : undefined,
            });

            const savedPatient = await queryRunner.manager.save(newPatient);
            this.logger.log(`✅ Patient created: ${savedPatient.nama_lengkap} (${savedPatient.nomor_rekam_medis})`);

            return savedPatient;
        });
    }

    /**
     * Ambil semua pasien dengan pagination
     */
    async findAll(query: SearchPatientDto): Promise<any> {
        try {
            const { page = 1, limit = 10 } = query;
            const skip = (page - 1) * limit;

            const [patients, total] = await this.patientRepository.findAndCount({
                order: { created_at: 'DESC' },
                select: [
                    'id', 'nomor_rekam_medis', 'nik', 'nama_lengkap',
                    'tanggal_lahir', 'jenis_kelamin', 'email', 'no_hp', 'created_at'
                ],
                take: limit,
                skip: skip,
            });

            this.logger.log(`📋 Retrieved ${patients.length}/${total} patients (page ${page})`);

            return {
                data: patients,
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
    }

    /**
     * Search pasien dengan full features
     */
    async search(query: SearchPatientDto): Promise<any> {
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
                data: patients,
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
    }

    async findOne(id: number): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { id },
                relations: ['appointments'],
            });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            return patient;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`❌ Error finding patient ID ${id}:`, error);
            throw new BadRequestException('Gagal mengambil data pasien');
        }
    }

    async findByMedicalRecordNumber(nomorRekamMedis: string): Promise<Patient> {
        return this.findByField('nomor_rekam_medis', nomorRekamMedis, 'nomor rekam medis');
    }

    async findByNik(nik: string): Promise<Patient> {
        return this.findByField('nik', nik, 'NIK');
    }

    async findByDoctor(doctorId: number, query: SearchPatientDto): Promise<any> {
        try {
            const { page = 1, limit = 10, search } = query;
            const skip = (page - 1) * limit;

            const qb = this.patientRepository
                .createQueryBuilder('patient')
                .leftJoin('appointments', 'appointment', 'appointment.patient_id = patient.id')
                .where('appointment.doctor_id = :doctorId', { doctorId });

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
                data: patients,
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

    async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOneBy({ id });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            // Validasi update
            await this.validator.validateUpdate(id, updatePatientDto, this.patientRepository);

            // Update data
            Object.assign(patient, updatePatientDto);

            if (updatePatientDto.tanggal_lahir) {
                patient.tanggal_lahir = new Date(updatePatientDto.tanggal_lahir);
            }

            const updatedPatient = await this.patientRepository.save(patient);
            this.logger.log(`✅ Patient updated: #${id} - ${updatedPatient.nama_lengkap}`);

            return updatedPatient;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
                throw error;
            }
            this.logger.error(`❌ Error updating patient ID ${id}:`, error);
            throw new BadRequestException('Gagal mengupdate data pasien');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { id },
                relations: ['appointments'],
            });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            if (patient.appointments?.length > 0) {
                throw new ConflictException(
                    'Tidak bisa menghapus pasien yang sudah memiliki riwayat janji temu'
                );
            }

            await this.patientRepository.remove(patient);
            this.logger.log(`🗑️ Patient deleted: #${id} - ${patient.nama_lengkap}`);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            this.logger.error(`❌ Error deleting patient ID ${id}:`, error);
            throw new BadRequestException('Gagal menghapus pasien');
        }
    }

    /**
     * Helper method untuk find by field
     */
    private async findByField(field: string, value: string, fieldLabel: string): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { [field]: value } as any,
                relations: ['appointments'],
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