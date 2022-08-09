import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IErrorLog } from 'src/interfaces/errorLog.interface';
import { LogService } from '../log/log.service';
import { isNumeric } from '../utils/functions.utils';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private logService: LogService,
    private config: ConfigService,
  ) {}
  async catch(exception: any, host: ArgumentsHost) {
    this.logger.error(exception, exception.name, exception.code);
    const ctx = host.switchToHttp();
    const { httpAdapter } = this.httpAdapterHost;

    let statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message =
      exception.response?.message ||
      exception?.response ||
      exception?.sqlMessage ||
      exception?.name;

    let originalMessage = message;

    switch (exception.name) {
      case 'TokenExpiredError':
        message = 'Token đã hết hạn..';
        statusCode = 408;
        break;
      case 'ETIMEDOUT':
        message = 'Thời gian request quá lâu.';
        statusCode = 504;
        break;
      default:
        message =
          exception.response?.message ||
          exception?.response ||
          exception.sqlMessage ||
          exception.toString();
    }

    let request = ctx.getRequest();
    let errorDetails = exception?.stack
      ? JSON.stringify([
          message,
          ...exception?.stack
            .split('\n')
            .map((stackItem) => stackItem.trim().replace(/\\/gi, '_dashdash'))
            .reverse(),
        ])
      : message + '\n' + exception?.stack;

    let logData: IErrorLog = {
      headers: JSON.stringify(request.headers),
      path_name: request?.route?.path,
      original_url: `${this.config.get<string>('api')}${request?.originalUrl}`,
      params: JSON.stringify(request?.params),
      query: JSON.stringify(request?.query),
      method: request?.method,
      body: request.body ? JSON.stringify(request?.body) : null,
      error_details: errorDetails,
      status_code: isNumeric(statusCode)
        ? statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR,
    };
    if (logData['status_code'] != 404) {
      await this.logService.insertErrorLog(logData);
    }

    const responseBody = {
      statusCode: isNumeric(statusCode)
        ? statusCode
        : HttpStatus.INTERNAL_SERVER_ERROR,
      data: null,
      message: originalMessage,
      timestamp: new Date().toLocaleString(),
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      isNumeric(statusCode) ? statusCode : HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
