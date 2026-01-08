// backend/src/payments/interface/http/interceptors/payment-transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class PaymentTransformInterceptor<T> implements NestInterceptor<
  T,
  StandardResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // If response already has the standard structure, return as is
        if (
          response &&
          typeof response === 'object' &&
          'statusCode' in response
        ) {
          return {
            ...response,
            timestamp: new Date().toISOString(),
          };
        }

        // Otherwise, wrap it in standard structure
        const ctx = context.switchToHttp();
        const httpResponse = ctx.getResponse();

        return {
          statusCode: httpResponse.statusCode,
          message: 'Success',
          data: response,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
