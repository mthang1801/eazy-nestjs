import { IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  birthday: string;

  @IsOptional()
  @IsNumber()
  province: number;

  @IsOptional()
  @IsNumber()
  district: number;

  @IsOptional()
  @IsNumber()
  ward: number;
}
