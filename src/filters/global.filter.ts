import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaHandler } from './prisma.handler';

@Catch()
export class GlobalFilter implements ExceptionFilter {
  private prismaHandler: PrismaHandler = new PrismaHandler();
  private readonly logger = new Logger(GlobalFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const handled = this.prismaHandler.validate(exception, host);
    if (handled) {
      return; // If the exception was handled by PrismaHandler, exit early
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';
    this.logger.error(
      `Request ${request.method} ${request.url} failed`,
      exception instanceof Error ? exception.stack : '',
    );
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
