// backend/src/payments/applications/validators/is-sufficient-payment.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isSufficientPayment', async: false })
export class IsSufficientPaymentConstraint implements ValidatorConstraintInterface {
    validate(jumlahBayar: any, args: ValidationArguments) {
        const object = args.object as any;
        const totalBiaya = object.totalBiaya;
        const diskonTotal = object.diskonTotal || 0;

        if (typeof jumlahBayar !== 'number' || typeof totalBiaya !== 'number') {
            return true; // Let other validators handle type checking
        }

        const totalAkhir = totalBiaya - diskonTotal;

        // Allow partial payments, just check if non-negative
        return jumlahBayar >= 0;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Jumlah bayar tidak valid';
    }
}

export function IsSufficientPayment(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSufficientPaymentConstraint,
        });
    };
}