import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Map HTTP status → default error-field string. Built-in Nest exceptions
// (UnauthorizedException etc.) return getResponse() without an `error` field,
// so every 401/403/404 was leaking "Internal Server Error" in the payload.
function defaultErrorForStatus(status: number): string {
    switch (status) {
        case 400: return 'Bad Request';
        case 401: return 'Unauthorized';
        case 403: return 'Forbidden';
        case 404: return 'Not Found';
        case 405: return 'Method Not Allowed';
        case 409: return 'Conflict';
        case 413: return 'Payload Too Large';
        case 422: return 'Unprocessable Entity';
        case 429: return 'Too Many Requests';
        case 502: return 'Bad Gateway';
        case 503: return 'Service Unavailable';
        case 504: return 'Gateway Timeout';
        default:  return 'Internal Server Error';
    }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';

        // NestJS HttpException (BadRequest, NotFound, Unauthorized, etc.)
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
                error = defaultErrorForStatus(status);
            } else if (typeof res === 'object' && res !== null) {
                message = (res as any).message || message;
                error = (res as any).error || defaultErrorForStatus(status);
            } else {
                error = defaultErrorForStatus(status);
            }
        }
        // Prisma known request errors
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002': // Unique constraint violation
                    status = HttpStatus.CONFLICT;
                    message = 'A record with this value already exists';
                    error = 'Conflict';
                    break;
                case 'P2025': // Record not found
                    status = HttpStatus.NOT_FOUND;
                    message = 'Record not found';
                    error = 'Not Found';
                    break;
                case 'P2003': // Foreign key constraint
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Related record not found';
                    error = 'Bad Request';
                    break;
                default:
                    status = HttpStatus.BAD_REQUEST;
                    message = 'Database operation failed';
                    error = 'Bad Request';
            }
        }
        // Prisma validation errors
        else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid data provided';
            error = 'Validation Error';
        }

        // Log full error for debugging (never expose to client)
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} → ${status}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            this.logger.warn(
                `${request.method} ${request.url} → ${status}: ${message} [Prisma ${exception.code}] ${JSON.stringify(exception.meta || {})}`,
            );
        } else if (exception instanceof Prisma.PrismaClientValidationError) {
            this.logger.warn(
                `${request.method} ${request.url} → ${status}: ${message} [Prisma ValidationError] ${exception.message.substring(0, 200)}`,
            );
        } else {
            this.logger.warn(`${request.method} ${request.url} → ${status}: ${message}`);
        }

        response.status(status).json({
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
