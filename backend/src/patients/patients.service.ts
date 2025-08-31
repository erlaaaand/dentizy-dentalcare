import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
    ) { }

    async create(createPatientDto: CreatePatientDto): Promise<Patient> {
        const nomorRekamMedis = await this.generateMedicalRecordNumber();
        const newPatient = this.patientRepository.create({
            ...createPatientDto,
            nomor_rekam_medis: nomorRekamMedis,
        });
        return this.patientRepository.save(newPatient);
    }

    findAll(): Promise<Patient[]> {
        return this.patientRepository.find();
    }

    async findOne(id: number): Promise<Patient> {
        const patient = await this.patientRepository.findOneBy({ id });
        if (!patient) {
            throw new NotFoundException(`Pasien dengan ID #${id} tidak ditemukan`);
        }
        return patient;
    }

    async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
        const patient = await this.findOne(id);
        Object.assign(patient, updatePatientDto);
        return this.patientRepository.save(patient);
    }

    async remove(id: number): Promise<void> {
        const patient = await this.findOne(id);
        await this.patientRepository.remove(patient);
    }

    private async generateMedicalRecordNumber(): Promise<string> {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const datePrefix = `${year}${month}${day}`;
        const lastPatientToday = await this.patientRepository.findOne({
            where: { nomor_rekam_medis: Like(`${datePrefix}-%`) },
            order: { nomor_rekam_medis: 'DESC' },
        });
        let nextSequence = 1;
        if (lastPatientToday) {
            const lastSequence = parseInt(lastPatientToday.nomor_rekam_medis.split('-')[1]);
            nextSequence = lastSequence + 1;
        }
        const sequenceString = nextSequence.toString().padStart(3, '0');
        return `${datePrefix}-${sequenceString}`;
    }
}