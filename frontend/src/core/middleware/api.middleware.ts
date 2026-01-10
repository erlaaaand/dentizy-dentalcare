// frontend/src/core/middleware/api.middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { errorHandler } from '@/core/errors/error.handler';
import { ApiError } from '@/core/errors/api.error';

export async function apiMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    try {
        return await handler(request);
    } catch (error) {
        const appError: ApiError = errorHandler.handle(error);

        return NextResponse.json(
            {
                success: false,
                message: appError.message,
                statusCode: appError.statusCode,
                errors: appError.getValidationErrors(),
                timestamp: appError.timestamp
            },
            { status: appError.statusCode }
        );
    }
}