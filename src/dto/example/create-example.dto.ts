import {
  ArrayMaxSize,
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
import { ApiProperty } from '@nestjs/swagger';

export class CreateExampleDto {
  @ApiProperty({
    type: String,
    required: true,
    minLength: 3,
    maxLength: 128,
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @ApiProperty({
    type: [String],
    maxLength: 3,
    default: [],
    required: false,
    example: ['Johnn', 'Donny'],
  })
  @IsOptional()
  @ArrayMaxSize(3)
  other_names: string;

  @ApiProperty({
    type: String,
    required: true,
    description: 'Email of customer',
    example: 'johndoe@email.com',
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  email: string;

  @ApiProperty({
    type: String,
    enum: ['true', 'false'],
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.INVALID_BOOLEAN' })
  isSubscribeEmail: string;

  @ApiProperty({
    type: String,
    enum: ['Admin', 'Maketing', 'User', 'Customer'],
    default: 'Customer',
    required: false,
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  role: string;

  @ApiProperty({
    type: Number,
    required: false,
    example: 255, //Ho Chi Minh City
  })
  @IsNumber({}, { message: i18nValidationMessage('validation.INVALID_NUMBER') })
  @IsOptional()
  province_id: number;

  @ApiProperty({
    type: Number,
    example: 775,
    required: false,
  })
  @IsNumber({}, { message: i18nValidationMessage('validation.INVALID_NUMBER') })
  @IsOptional()
  district_id: number;

  @ApiProperty({
    type: Number,
    example: 8790,
    required: false,
  })
  @IsNumber({}, { message: i18nValidationMessage('validation.INVALID_NUMBER') })
  @IsOptional()
  ward_id: number;

  @ApiProperty({
    type: String,
    maxLength: 256,
    required: false,
    example: '123 Quang Trung str',
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  @IsNotEmpty()
  address: number;

  @ApiProperty({
    type: String,
    minLength: 9,
    maxLength: 20,
    example: '0123456789',
    required: true,
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  phone: string;

  @ApiProperty({
    type: String,
    format: 'YYYY-MM-DD',
    example: '1999-11-20',
    required: false,
  })
  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  date_of_birth: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'number',
      },
    },
    required: false,
    example: [
      [110.7294, 10.8372489],
      [111.47382947, 10.4732984],
    ],
  })
  @IsOptional()
  store_coords: number[][];

  @ApiProperty({ type: String, default: '', required: false })
  @IsString({ message: i18nValidationMessage('validation.INVALID_STRING') })
  @IsOptional()
  avatar: string;
}
