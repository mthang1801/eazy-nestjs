import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserGroupsDto {
  @IsNotEmpty()
  code: string = '';

  @IsNotEmpty()
  usergroup: string = '';

  @ArrayNotEmpty()
  privileges: number[];
}
