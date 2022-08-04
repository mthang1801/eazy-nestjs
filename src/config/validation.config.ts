import { ValidatorOptions } from 'class-validator';
import { HttpStatus } from '@nestjs/common';

export const ValidationConfig: ValidatorOptions | Record<string, any> = {
  whitelist: true,
  errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE,
  forbidNonWhitelisted: false,
  disableErrorMessages: false,
  skipMissingProperties: true,
  enableDebugMessages: true,
  skipUndefinedProperties: true,
  skipNullProperties: true,
  forbidUnknownValues: true,
  dismissDefaultMessages: false,
};
