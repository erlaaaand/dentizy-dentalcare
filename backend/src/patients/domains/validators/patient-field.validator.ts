import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PatientFieldValidator {
    /**
         * Validate age range logic
         */
    private validateAgeRange(minAge?: number, maxAge?: number): void {
        if (minAge !== undefined && maxAge !== undefined) {
            if (minAge > maxAge) {
                throw new BadRequestException(
                    'Umur minimal tidak boleh lebih besar dari umur maksimal'
                );
            }

            if (minAge < 0 || maxAge < 0) {
                throw new BadRequestException('Umur tidak boleh negatif');
            }

            if (minAge > 150 || maxAge > 150) {
                throw new BadRequestException('Umur tidak valid (maksimal 150 tahun)');
            }
        }
    }
}