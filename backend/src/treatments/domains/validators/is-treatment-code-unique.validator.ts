// backend/src/treatments/applications/validators/is-treatment-code-unique.validator.ts
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { TreatmentRepository } from '../../infrastructures/persistence/repositories/treatment.repository';

@ValidatorConstraint({ name: 'IsTreatmentCodeUnique', async: true })
@Injectable()
export class IsTreatmentCodeUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly treatmentRepository: TreatmentRepository) {}

  async validate(
    kodePerawatan: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    if (!kodePerawatan) return true;

    const excludeId = (args.object as any).id;
    return !(await this.treatmentRepository.isKodeExists(
      kodePerawatan,
      excludeId,
    ));
  }

  defaultMessage(args: ValidationArguments): string {
    return `Treatment code '${args.value}' already exists`;
  }
}

export function IsTreatmentCodeUnique(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTreatmentCodeUniqueConstraint,
    });
  };
}
