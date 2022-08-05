import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { RolesEnum } from '../../enums/role.enum';
import { Pet, ICat, IDog } from '../../enums/pet.enum';
import {
  arrayMaxSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(128)
  @ApiProperty({
    minLength: 3,
    maxLength: 128,
    type: String,
  })
  firstname: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(128)
  @ApiProperty({
    minLength: 3,
    maxLength: 128,
    type: String,
  })
  lastname: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    type: String,
  })
  email: string;

  @IsNotEmpty()
  @MaxLength(15)
  @ApiProperty({
    description: 'user mobile phone',
    type: String,
    maxLength: 15,
  })
  phone: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    type: String,
    required: false,
    format: 'YYYY-MM-DD',
  })
  date_of_birth: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    type: [Number],
    default: [],
    required: false,
  })
  accumulative_points: number[];

  @IsOptional()
  @ApiProperty({
    enum: ['Admin', 'Manager', 'Moderator', 'Customer', 'User'],
    default: 'User',
    required: false,
  })
  role: RolesEnum;

  @IsOptional()
  @ApiProperty({
    type: Number,
    required: false,
  })
  platform_id: number[];

  @IsOptional()
  @ApiProperty({
    type: 'array',
    required: false,
    items: {
      type: 'array',
      default: [],
      items: {
        type: 'number',
      },
    },
  })
  coords: number[][];

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
  })
  province: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
  })
  district: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false,
  })
  ward: number;
}
