// backend/src/medical-record-treatments/applications/validators/is-valid-discount.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidDiscount', async: false })
export class IsValidDiscountConstraint implements ValidatorConstraintInterface {
  validate(diskon: number, args: ValidationArguments): boolean {
    const object = args.object as any;
    if (diskon === undefined || diskon === null) return true;

    if (diskon < 0) return false;

    // Calculate subtotal
    const jumlah = object.jumlah || 0;
    const hargaSatuan = object.hargaSatuan || 0;
    const subtotal = jumlah * hargaSatuan;

    return diskon <= subtotal;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Diskon tidak boleh lebih besar dari subtotal';
  }
}

export function IsValidDiscount(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDiscountConstraint,
    });
  };
}
