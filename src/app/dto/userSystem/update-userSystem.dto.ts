import { IsOptional } from 'class-validator';

export class UpdateUserSystemDto {
  @IsOptional()
  firstname: string;

  @IsOptional()
  lastname: string;

  @IsOptional()
  status: string;

  @IsOptional()
  usergroup_id: number;

  @IsOptional()
  store_id: number;
}
