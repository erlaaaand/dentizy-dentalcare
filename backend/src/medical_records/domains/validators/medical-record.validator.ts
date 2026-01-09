// domains/validators/medical-record.validator.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { MedicalRecord } from '../entities/medical-record.entity';

@Injectable()
export class MedicalRecordValidator {
  /**
   * Validate medical record ID
   */
  validateId(id: number | null | undefined): void {
    if (!id || id <= 0) {
      throw new BadRequestException('ID rekam medis tidak valid');
    }
  }

  /**
   * Validate appointment ID
   */
  validateAppointmentId(appointmentId: number | null | undefined): void {
    if (!appointmentId || appointmentId <= 0) {
      throw new BadRequestException('ID janji temu tidak valid');
    }
  }

  /**
   * Validate user ID
   */
  validateUserId(userId: number | null | undefined): void {
    if (!userId || userId <= 0) {
      throw new BadRequestException('ID user tidak valid');
    }
  }

  /**
   * Validate medical record exists
   */
  validateExists(medicalRecord: MedicalRecord | null | undefined): void {
    if (!medicalRecord) {
      throw new BadRequestException('Rekam medis tidak ditemukan');
    }
  }

  /**
   * Validate SOAP field is not too long
   */
  validateFieldLength(
    fieldName: string,
    value: string | null | undefined,
    maxLength: number = 5000,
  ): void {
    if (value && value.length > maxLength) {
      throw new BadRequestException(
        `${fieldName} tidak boleh lebih dari ${maxLength} karakter`,
      );
    }
  }

  /**
   * Validate all SOAP fields
   */
  validateSOAPFields(data: Partial<MedicalRecord>): void {
    if (data.subjektif) {
      this.validateFieldLength('Subjektif', data.subjektif);
    }
    if (data.objektif) {
      this.validateFieldLength('Objektif', data.objektif);
    }
    if (data.assessment) {
      this.validateFieldLength('Assessment', data.assessment);
    }
    if (data.plan) {
      this.validateFieldLength('Plan', data.plan);
    }
  }

  /**
   * Validate that medical record has required relations loaded
   */
  validateRelationsLoaded(
    medicalRecord: MedicalRecord,
    relations: string[],
  ): void {
    for (const relation of relations) {
      const relationKey = relation as keyof MedicalRecord;
      if (!medicalRecord[relationKey]) {
        throw new BadRequestException(
          `Relation '${relation}' harus dimuat terlebih dahulu`,
        );
      }
    }
  }
}
