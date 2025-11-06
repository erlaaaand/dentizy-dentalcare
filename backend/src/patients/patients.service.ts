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

@Injectable()
export class PatientsService {
    private readonly logger = new Logger(PatientsService.name);
    private readonly MAX_RETRY_ATTEMPTS = 5;

    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        private readonly dataSource: DataSource,
    ) { }

    /**
     * ✅ FIX: Buat pasien dengan transaction dan retry mechanism
     */
    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        let attempts = 0;
        let lastError: Error = new Error('Unknown error occurred');

        while (attempts < this.MAX_RETRY_ATTEMPTS) {
            attempts++;
            const queryRunner = this.dataSource.createQueryRunner();
            
            try {
                await queryRunner.connect();
                await queryRunner.startTransaction();

                // 1. CEK: NIK sudah ada atau belum (jika diisi)
                if (createPatientDto.nik) {
                    const existingPatientByNik = await queryRunner.manager.findOne(Patient, {
                        where: { nik: createPatientDto.nik }
                    });

                    if (existingPatientByNik) {
                        throw new ConflictException(`Pasien dengan NIK ${createPatientDto.nik} sudah terdaftar`);
                    }
                }

                // 2. CEK: Email sudah ada atau belum (jika diisi)
                if (createPatientDto.email) {
                    const existingPatientByEmail = await queryRunner.manager.findOne(Patient, {
                        where: { email: createPatientDto.email }
                    });

                    if (existingPatientByEmail) {
                        throw new ConflictException(`Pasien dengan email ${createPatientDto.email} sudah terdaftar`);
                    }
                }

                // 3. GENERATE NOMOR REKAM MEDIS dengan ATOMIC COUNTER
                const nomorRekamMedis = await this.generateMedicalRecordNumberAtomic(queryRunner);

                // 4. Validasi tanggal lahir tidak boleh > hari ini
                if (createPatientDto.tanggal_lahir) {
                    const birthDate = new Date(createPatientDto.tanggal_lahir);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (birthDate > today) {
                        throw new BadRequestException('Tanggal lahir tidak boleh di masa depan');
                    }
                }

                // 5. BUAT PASIEN BARU
                const newPatient = queryRunner.manager.create(Patient, {
                    ...createPatientDto,
                    nomor_rekam_medis: nomorRekamMedis,
                    tanggal_lahir: createPatientDto.tanggal_lahir
                        ? new Date(createPatientDto.tanggal_lahir)
                        : undefined,
                });

                const savedPatient = await queryRunner.manager.save(newPatient);

                await queryRunner.commitTransaction();

                this.logger.log(`✅ Patient created: ${savedPatient.nama_lengkap} (${savedPatient.nomor_rekam_medis})`);

                return savedPatient;

            } catch (error) {
                await queryRunner.rollbackTransaction();
                lastError = error;

                // Don't retry on validation errors
                if (error instanceof ConflictException || error instanceof BadRequestException) {
                    throw error;
                }

                // Retry on deadlock or lock timeout
                if (this.isRetryableError(error) && attempts < this.MAX_RETRY_ATTEMPTS) {
                    const backoffTime = Math.min(100 * Math.pow(2, attempts - 1), 1000);
                    this.logger.warn(`⚠️ Retry attempt ${attempts}/${this.MAX_RETRY_ATTEMPTS} after ${backoffTime}ms`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                    continue;
                }

                this.logger.error('❌ Error creating patient:', error);
                throw new BadRequestException('Gagal mendaftarkan pasien baru');
            } finally {
                await queryRunner.release();
            }
        }

        // If all retries failed
        this.logger.error(`❌ Failed to create patient after ${this.MAX_RETRY_ATTEMPTS} attempts:`, lastError);
        throw new BadRequestException('Gagal mendaftarkan pasien baru setelah beberapa percobaan');
    }

    /**
     * ✅ FIX: Check if error is retryable (deadlock, lock timeout)
     */
    private isRetryableError(error: any): boolean {
        const retryableCodes = [
            'ER_LOCK_DEADLOCK',
            'ER_LOCK_WAIT_TIMEOUT',
            '40001', // Serialization failure
            '40P01', // Deadlock detected (PostgreSQL)
        ];

        return retryableCodes.some(code => 
            error.code === code || error.message?.includes(code)
        );
    }

    /**
     * Ambil semua pasien dengan pagination
     */
    async findAll(query: SearchPatientDto): Promise<any> {
        try {
            const { page = 1, limit = 10 } = query;
            const skip = (page - 1) * limit;

            const [patients, total] = await this.patientRepository.findAndCount({
                order: {
                    created_at: 'DESC',
                },
                select: [
                    'id',
                    'nomor_rekam_medis',
                    'nik',
                    'nama_lengkap',
                    'tanggal_lahir',
                    'jenis_kelamin',
                    'email',
                    'no_hp',
                    'created_at'
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
     * Search patients dengan multiple criteria
     */
    async search(query: SearchPatientDto): Promise<any> {
        try {
            const { search, page = 1, limit = 10 } = query;
            const skip = (page - 1) * limit;

            const queryBuilder = this.patientRepository
                .createQueryBuilder('patient')
                .select([
                    'patient.id',
                    'patient.nomor_rekam_medis',
                    'patient.nik',
                    'patient.nama_lengkap',
                    'patient.tanggal_lahir',
                    'patient.jenis_kelamin',
                    'patient.email',
                    'patient.no_hp',
                ])
                .where('patient.nama_lengkap LIKE :search', { search: `%${search}%` })
                .orWhere('patient.nik LIKE :search', { search: `%${search}%` })
                .orWhere('patient.nomor_rekam_medis LIKE :search', { search: `%${search}%` })
                .orWhere('patient.email LIKE :search', { search: `%${search}%` })
                .orderBy('patient.nama_lengkap', 'ASC')
                .take(limit)
                .skip(skip);

            const [patients, total] = await queryBuilder.getManyAndCount();

            this.logger.log(`🔍 Found ${patients.length}/${total} patients for "${search}"`);

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
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error('❌ Error searching patients:', error);
            throw new BadRequestException('Gagal mencari pasien');
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
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`❌ Error finding patient ID ${id}:`, error);
            throw new BadRequestException('Gagal mengambil data pasien');
        }
    }

    async findByMedicalRecordNumber(nomorRekamMedis: string): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { nomor_rekam_medis: nomorRekamMedis },
                relations: ['appointments'],
            });

            if (!patient) {
                throw new NotFoundException(
                    `Pasien dengan nomor rekam medis ${nomorRekamMedis} tidak ditemukan`
                );
            }

            return patient;

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`❌ Error finding patient by medical record number:`, error);
            throw new BadRequestException('Gagal mencari pasien');
        }
    }

    async findByNik(nik: string): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { nik },
                relations: ['appointments'],
            });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan NIK ${nik} tidak ditemukan`);
            }

            return patient;

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`❌ Error finding patient by NIK:`, error);
            throw new BadRequestException('Gagal mencari pasien');
        }
    }

    async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOneBy({ id });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            // CEK: Jika update NIK, pastikan tidak duplicate
            if (updatePatientDto.nik && updatePatientDto.nik !== patient.nik) {
                const existingPatient = await this.patientRepository.findOne({
                    where: { nik: updatePatientDto.nik }
                });

                if (existingPatient) {
                    throw new ConflictException(`NIK ${updatePatientDto.nik} sudah digunakan`);
                }
            }

            // CEK: Jika update email, pastikan tidak duplicate
            if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
                const existingPatient = await this.patientRepository.findOne({
                    where: { email: updatePatientDto.email }
                });

                if (existingPatient) {
                    throw new ConflictException(`Email ${updatePatientDto.email} sudah digunakan`);
                }
            }

            // Validasi tanggal lahir
            if (updatePatientDto.tanggal_lahir) {
                const birthDate = new Date(updatePatientDto.tanggal_lahir);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (birthDate > today) {
                    throw new BadRequestException('Tanggal lahir tidak boleh di masa depan');
                }
            }

            // UPDATE DATA
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

            // VALIDASI: Jangan hapus pasien yang sudah punya appointment
            if (patient.appointments && patient.appointments.length > 0) {
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
     * ✅ FIX: Generate nomor rekam medis dengan proper atomic operation
     * Using QueryBuilder for better performance and safety
     */
    private async generateMedicalRecordNumberAtomic(queryRunner: any): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;

        try {
            // ✅ FIX: Use proper query builder with parameter binding
            const result = await queryRunner.manager
                .createQueryBuilder(Patient, 'patient')
                .select('patient.nomor_rekam_medis', 'nomor_rekam_medis')
                .where('patient.nomor_rekam_medis LIKE :pattern', { 
                    pattern: `${datePrefix}-%` 
                })
                .orderBy('patient.nomor_rekam_medis', 'DESC')
                .limit(1)
                .setLock('pessimistic_write') // Lock the row
                .getRawOne();

            let nextSequence = 1;

            if (result && result.nomor_rekam_medis) {
                const lastNumber = result.nomor_rekam_medis;
                const parts = lastNumber.split('-');
                
                if (parts.length === 2 && parts[0] === datePrefix) {
                    const lastSequence = parseInt(parts[1], 10);
                    
                    if (!isNaN(lastSequence)) {
                        nextSequence = lastSequence + 1;
                    }
                }
            }

            // Ensure sequence doesn't exceed 999 per day
            if (nextSequence > 999) {
                throw new Error('Maximum patient registrations per day exceeded (999)');
            }

            const sequenceString = nextSequence.toString().padStart(3, '0');
            const nomorRekamMedis = `${datePrefix}-${sequenceString}`;

            this.logger.log(`📋 Generated medical record number: ${nomorRekamMedis}`);

            return nomorRekamMedis;

        } catch (error) {
            this.logger.error('❌ Error generating medical record number:', error);
            throw new Error('Gagal generate nomor rekam medis');
        }
    }
}