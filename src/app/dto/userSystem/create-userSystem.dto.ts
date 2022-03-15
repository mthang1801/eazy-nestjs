import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserSystemDto {
  @IsNotEmpty()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  usergroup_id: number;

  @IsNotEmpty()
  store_id: number;
}
