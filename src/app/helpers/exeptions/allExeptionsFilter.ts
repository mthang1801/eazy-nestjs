import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message =
      exception.response?.message ||
      exception?.response ||
      exception?.sqlMessage;
    this.logger.error(exception, exception.name, exception.code);
    if (httpStatus === 500) {
      message = `Hệ thống đang xảy ra lỗi, vui lòng quay lại sau. [${message}] `;
    }
    switch (exception.name) {
      case 'TokenExpiredError':
        message = 'Token đã hết hạn.';
        break;
      case 'ETIMEDOUT':
        message = 'Thời gian request quá lâu.';
        break;
      case 'Error':
        message =
          exception.response?.message ||
          exception?.response ||
          exception.sqlMessage;
        break;
    }

    const responseBody = {
      statusCode: httpStatus,
      message,
      timestamp: new Date().toLocaleString(),
      // path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
