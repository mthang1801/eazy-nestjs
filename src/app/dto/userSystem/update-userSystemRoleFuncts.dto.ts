import { IsOptional, ArrayNotEmpty } from 'class-validator';

export class UpdateUserSystemRoleFunctsDto {
  @ArrayNotEmpty()
  role_funct_ids: number[];
}
