import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserGroupsDto {
  @IsNotEmpty()
  usergroup: string = '';

  @IsOptional()
  status: string = 'A';

  @IsOptional()
  privileges: number[] = [];
}
