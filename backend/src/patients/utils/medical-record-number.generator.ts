// ============================================
// FILE 2: utils/medical-record-number.generator.ts
// ============================================
import { Injectable, Logger } from '@nestjs/common';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class MedicalRecordNumberGenerator {
    private readonly logger = new Logger(MedicalRecordNumberGenerator.name);

    /**
     * Generate nomor rekam medis dengan atomic operation
     */
    async generate(queryRunner: any): Promise<string> {
        const datePrefix = this.getDatePrefix();

        try {
            const result = await queryRunner.manager
                .createQueryBuilder(Patient, 'patient')
                .select('patient.nomor_rekam_medis', 'nomor_rekam_medis')
                .where('patient.nomor_rekam_medis LIKE :pattern', {
                    pattern: `${datePrefix}-%`
                })
                .orderBy('patient.nomor_rekam_medis', 'DESC')
                .limit(1)
                .setLock('pessimistic_write')
                .getRawOne();

            const nextSequence = this.calculateNextSequence(result, datePrefix);

            if (nextSequence > 999) {
                throw new Error('Maximum patient registrations per day exceeded (999)');
            }

            const nomorRekamMedis = `${datePrefix}-${nextSequence.toString().padStart(3, '0')}`;
            this.logger.log(`📋 Generated medical record number: ${nomorRekamMedis}`);

            return nomorRekamMedis;
        } catch (error) {
            this.logger.error('❌ Error generating medical record number:', error);
            throw new Error('Gagal generate nomor rekam medis');
        }
    }

    private getDatePrefix(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}${month}${day}`;
    }

    private calculateNextSequence(result: any, datePrefix: string): number {
        if (!result?.nomor_rekam_medis) return 1;

        const parts = result.nomor_rekam_medis.split('-');
        if (parts.length === 2 && parts[0] === datePrefix) {
            const lastSequence = parseInt(parts[1], 10);
            if (!isNaN(lastSequence)) {
                return lastSequence + 1;
            }
        }
        return 1;
    }
}