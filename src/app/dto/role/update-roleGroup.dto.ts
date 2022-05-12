import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateRoleGroupDto {
  @IsString()
  @IsOptional()
  role_name: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsOptional()
  funct_ids: number[];
}
