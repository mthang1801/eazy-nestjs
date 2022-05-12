import { IsOptional } from 'class-validator';
export class AuthorizeRoleFunctionDto {
  @IsOptional()
  funct_ids: number[];

  @IsOptional()
  role_name: string;

  @IsOptional()
  status: string;
}
