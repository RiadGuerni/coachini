import { ArgumentsHost, Logger } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Response, Request } from 'express';

export class PrismaHandler {
  private readonly logger = new Logger(PrismaHandler.name);
  validate(exception: any, host: ArgumentsHost): boolean {
    if (
      exception instanceof PrismaClientKnownRequestError ||
      exception instanceof PrismaClientUnknownRequestError ||
      exception instanceof PrismaClientRustPanicError ||
      exception instanceof PrismaClientInitializationError ||
      exception instanceof PrismaClientValidationError
    ) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      let status = 500;
      if (exception instanceof PrismaClientValidationError) {
        // Validation errors typically indicate a bad request
        status = 400;
      }
      const message = exception.message;
      this.logger.error(
        `Request ${request.method} ${request.url} failed due to Prisma error: ${message}`,
        exception.stack,
      );
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });
      return true;
    }
    return false;
  }
}
