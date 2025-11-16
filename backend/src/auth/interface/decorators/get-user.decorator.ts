// backend\src\auth\interface\decorators\get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator (@GetUser) untuk mengekstrak objek 'user'
 * yang telah ditambahkan ke request oleh 'AuthGuard'.
 */
export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);