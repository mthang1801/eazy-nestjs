import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  role_name: string;

  @IsString()
  @IsOptional()
  status: string;
}
