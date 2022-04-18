import { IsOptional, IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  phone: string;

  @IsNotEmpty()
  password: string;
}
