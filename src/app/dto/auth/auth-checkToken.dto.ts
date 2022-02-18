import { IsNotEmpty } from 'class-validator';
export class AuthCheckTokenDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  user_id: string;
}
