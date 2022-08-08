import {
  ArrayNotEmpty,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { I18n, i18nValidationMessage } from 'nestjs-i18n';

class AddressDto {
  @IsNumber({}, { message: i18nValidationMessage('validation.INVALID_NUMBER') })
  @IsOptional()
  province_id: number;

  @IsNumber({}, { message: i18nValidationMessage('validation.INVALID_NUMBER') })
  @IsOptional()
  district_id: number;

  @IsNumber({}, { message: i18nValidationMessage('validation.INVALID_NUMBER') })
  @IsOptional()
  ward_id: number;

  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  @IsNotEmpty()
  address: number;
}

export class CreateExampleDto {
  @IsOptional()
  @IsBoolean({ message: 'validation.INVALID_BOOLEAN' })
  isSubscribeEmail: string;

  @Min(18, {
    message: i18nValidationMessage('validation.MIN'),
  })
  @IsOptional()
  @IsNumber()
  age: number;

  @Max(100, {
    message: i18nValidationMessage('validation.MAX'),
  })
  max: number;

  @IsNumber({}, { message: i18nValidationMessage('validation.INVALID_NUMBER') })
  num: number;

  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  str: string;

  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  email: string;

  @ValidateNested()
  @IsDefined()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  phone: string;

  @ArrayNotEmpty({
    message: i18nValidationMessage('validation.ARRAY_NOT_EMPTY'),
  })
  data: number[];
}
