import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class AuthUpdatePasswordDto {
  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  token: string;

  @MaxLength(32, { message: 'Password too long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Mật khẩu không hợp lệ, ít nhất phải có 8 ký tự gồm chữ thường, chữ in hoa, số và ký tự đặc biệt.',
  })
  password: string;
}
