import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  role_name: string;

  @IsString()
  @IsOptional()
  status: string;
}
