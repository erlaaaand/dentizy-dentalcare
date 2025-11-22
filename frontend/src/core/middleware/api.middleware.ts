import { NextRequest, NextResponse } from 'next/server';
import { ErrorHandler } from '../errors/error.handler';

export async function apiMiddleware(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  try {
    return await handler(request);
  } catch (error) {
    const appError = ErrorHandler.handle(error);
    
    return NextResponse.json(
      {
        success: false,
        message: appError.message,
        code: appError.code,
      },
      { status: appError.statusCode }
    );
  }
}