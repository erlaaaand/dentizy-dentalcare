import { 
    Injectable, 
    NotFoundException, 
    ConflictException,
    BadRequestException,
    Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
    private readonly logger = new Logger(PatientsService.name);

    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    /**
     * Buat pasien baru dengan nomor rekam medis otomatis
     */
    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        try {
            // 1. CEK: NIK sudah ada atau belum (jika diisi)
            if (createPatientDto.nik) {
                const existingPatientByNik = await this.patientRepository.findOne({
                    where: { nik: createPatientDto.nik }
                });

                if (existingPatientByNik) {
                    throw new ConflictException(`Pasien dengan NIK ${createPatientDto.nik} sudah terdaftar`);
                }
            }

            // 2. CEK: Email sudah ada atau belum (jika diisi)
            if (createPatientDto.email) {
                const existingPatientByEmail = await this.patientRepository.findOne({
                    where: { email: createPatientDto.email }
                });

                if (existingPatientByEmail) {
                    throw new ConflictException(`Pasien dengan email ${createPatientDto.email} sudah terdaftar`);
                }
            }

            // 3. GENERATE NOMOR REKAM MEDIS
            const nomorRekamMedis = await this.generateMedicalRecordNumber();

            // 4. BUAT PASIEN BARU
            const newPatient = this.patientRepository.create({
                ...createPatientDto,
                nomor_rekam_medis: nomorRekamMedis,
            });

            const savedPatient = await this.patientRepository.save(newPatient);

            this.logger.log(`Patient created: ${savedPatient.nama_lengkap} (${savedPatient.nomor_rekam_medis})`);

            return savedPatient;

        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }

            this.logger.error('Error creating patient:', error);
            throw new BadRequestException('Gagal mendaftarkan pasien baru');
        }
    }

    /**
     * Ambil semua pasien
     */
    async findAll(): Promise<Patient[]> {
        try {
            const patients = await this.patientRepository.find({
                order: {
                    created_at: 'DESC',
                },
                // Bisa tambahkan select untuk optimize
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
                ]
            });

            this.logger.log(`Retrieved ${patients.length} patients`);

            return patients;

        } catch (error) {
            this.logger.error('Error fetching patients:', error);
            throw new BadRequestException('Gagal mengambil daftar pasien');
        }
    }

    /**
     * Ambil pasien by ID
     */
    async findOne(id: number): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { id },
                relations: ['appointments'], // Include appointments untuk history
            });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            return patient;

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            this.logger.error(`Error finding patient ID ${id}:`, error);
            throw new BadRequestException('Gagal mengambil data pasien');
        }
    }

    /**
     * FITUR BARU: Cari pasien by nomor rekam medis
     */
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

            this.logger.error(`Error finding patient by medical record number:`, error);
            throw new BadRequestException('Gagal mencari pasien');
        }
    }

    /**
     * FITUR BARU: Cari pasien by NIK
     */
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

            this.logger.error(`Error finding patient by NIK:`, error);
            throw new BadRequestException('Gagal mencari pasien');
        }
    }

    /**
     * FITUR BARU: Search pasien by nama (partial match)
     */
    async searchByName(name: string): Promise<Patient[]> {
        try {
            if (!name || name.trim().length < 3) {
                throw new BadRequestException('Nama minimal 3 karakter');
            }

            const patients = await this.patientRepository.find({
                where: {
                    nama_lengkap: Like(`%${name}%`)
                },
                take: 20, // Limit hasil untuk performa
                order: {
                    nama_lengkap: 'ASC'
                }
            });

            this.logger.log(`Found ${patients.length} patients matching "${name}"`);

            return patients;

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            this.logger.error('Error searching patients:', error);
            throw new BadRequestException('Gagal mencari pasien');
        }
    }

    /**
     * Update pasien
     */
    async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        try {
            // 1. CEK: Pasien ada atau tidak
            const patient = await this.patientRepository.findOneBy({ id });

            if (!patient) {
                throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
            }

            // 2. CEK: Jika update NIK, pastikan tidak duplicate
            if (updatePatientDto.nik && updatePatientDto.nik !== patient.nik) {
                const existingPatient = await this.patientRepository.findOne({
                    where: { nik: updatePatientDto.nik }
                });

                if (existingPatient) {
                    throw new ConflictException(`NIK ${updatePatientDto.nik} sudah digunakan`);
                }
            }

            // 3. CEK: Jika update email, pastikan tidak duplicate
            if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
                const existingPatient = await this.patientRepository.findOne({
                    where: { email: updatePatientDto.email }
                });

                if (existingPatient) {
                    throw new ConflictException(`Email ${updatePatientDto.email} sudah digunakan`);
                }
            }

            // 4. UPDATE DATA
            Object.assign(patient, updatePatientDto);
            const updatedPatient = await this.patientRepository.save(patient);

            this.logger.log(`Patient updated: #${id} - ${updatedPatient.nama_lengkap}`);

            return updatedPatient;

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }

            this.logger.error(`Error updating patient ID ${id}:`, error);
            throw new BadRequestException('Gagal mengupdate data pasien');
        }
    }

    /**
     * Hapus pasien
     */
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

            this.logger.log(`Patient deleted: #${id} - ${patient.nama_lengkap}`);

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }

            this.logger.error(`Error deleting patient ID ${id}:`, error);
            throw new BadRequestException('Gagal menghapus pasien');
        }
    }

    /**
     * Generate nomor rekam medis otomatis
     * Format: YYYYMMDD-XXX
     * Contoh: 20250831-001
     */
    private async generateMedicalRecordNumber(): Promise<string> {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const datePrefix = `${year}${month}${day}`;

            // Cari nomor terakhir hari ini
            const lastPatientToday = await this.patientRepository.findOne({
                where: { nomor_rekam_medis: Like(`${datePrefix}-%`) },
                order: { nomor_rekam_medis: 'DESC' },
            });

            let nextSequence = 1;

            if (lastPatientToday) {
                // Ambil sequence dari nomor terakhir
                const lastSequence = parseInt(
                    lastPatientToday.nomor_rekam_medis.split('-')[1]
                );
                nextSequence = lastSequence + 1;
            }

            const sequenceString = nextSequence.toString().padStart(3, '0');
            const nomorRekamMedis = `${datePrefix}-${sequenceString}`;

            this.logger.log(`Generated medical record number: ${nomorRekamMedis}`);

            return nomorRekamMedis;

        } catch (error) {
            this.logger.error('Error generating medical record number:', error);
            throw new Error('Gagal generate nomor rekam medis');
        }
    }
}