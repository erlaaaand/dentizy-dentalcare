// backend/src/payments/applications/validators/is-future-date.validator.ts
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotFutureDate', async: false })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
    validate(dateString: any) {
        if (!dateString) return true;

        const date = new Date(dateString);
        const now = new Date();

        return date <= now;
    }

    defaultMessage() {
        return 'Tanggal pembayaran tidak boleh di masa depan';
    }
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsNotFutureDateConstraint,
        });
    };
}