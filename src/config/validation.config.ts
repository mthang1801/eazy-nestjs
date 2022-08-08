import { ValidatorOptions } from 'class-validator';
import { HttpStatus } from '@nestjs/common';
import { i18nValidationErrorFactory } from 'nestjs-i18n';

export const ValidationConfig: ValidatorOptions | Record<string, any> = {
  whitelist: true,
  errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
  exceptionFactory: i18nValidationErrorFactory,
  forbidNonWhitelisted: false,
  disableErrorMessages: false,
  skipMissingProperties: true,
  enableDebugMessages: true,
  skipUndefinedProperties: true,
  skipNullProperties: true,
  forbidUnknownValues: true,
  dismissDefaultMessages: false,
};
