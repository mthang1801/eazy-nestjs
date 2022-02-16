import { IsNotEmpty } from 'class-validator';

export class RestorePasswordOTPDto {
  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  otp: number;
}
