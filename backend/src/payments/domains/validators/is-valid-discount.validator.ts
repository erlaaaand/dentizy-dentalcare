// backend/src/payments/applications/validators/is-valid-discount.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PaymentPayload } from './is-sufficient-payment.validator';

@ValidatorConstraint({ name: 'isValidDiscount', async: false })
export class IsValidDiscountConstraint implements ValidatorConstraintInterface {
  validate(diskonTotal: number, args: ValidationArguments) {
    const object = args.object as PaymentPayload;
    const totalBiaya = object.totalBiaya;

    if (diskonTotal === undefined || diskonTotal === null) {
      return true; // Optional field
    }

    if (typeof diskonTotal !== 'number' || typeof totalBiaya !== 'number') {
      return false;
    }

    return diskonTotal >= 0 && diskonTotal <= totalBiaya;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Diskon tidak boleh negatif atau lebih besar dari total biaya';
  }
}

export function IsValidDiscount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDiscountConstraint,
    });
  };
}
